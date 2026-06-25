// geometry.js
// Funciones puras de geometría 2D para el cálculo de ejes y ángulos
// en radiografías de rodilla (proyección AP).
//
// Convenciones:
// - Coordenadas en píxeles de imagen: x crece a la derecha, y crece hacia ABAJO.
// - Cada "hueso" se define por dos círculos diafisarios (3 puntos cada uno)
//   cuyos centros determinan el eje anatómico.
// - La línea articular se define por 2 puntos.

/**
 * Circuncentro de 3 puntos (centro del círculo que pasa por los 3).
 * Devuelve { x, y, r } o null si los puntos son colineales.
 */
export function circleFrom3Points(p1, p2, p3) {
  const { x: x1, y: y1 } = p1;
  const { x: x2, y: y2 } = p2;
  const { x: x3, y: y3 } = p3;

  const a = x1 - x2;
  const b = y1 - y2;
  const c = x1 - x3;
  const d = y1 - y3;

  const e = (x1 ** 2 - x2 ** 2 + y1 ** 2 - y2 ** 2) / 2;
  const f = (x1 ** 2 - x3 ** 2 + y1 ** 2 - y3 ** 2) / 2;

  const det = a * d - b * c;
  if (Math.abs(det) < 1e-9) return null; // colineales

  const cx = (d * e - b * f) / det;
  const cy = (a * f - c * e) / det;
  const r = Math.hypot(x1 - cx, y1 - cy);

  return { x: cx, y: cy, r };
}

/** Ángulo (en grados, 0-360) de un vector respecto al eje X positivo, con y hacia abajo. */
function vectorAngleDeg(dx, dy) {
  let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

/** Diferencia angular mínima entre dos ángulos (0-180), dado en grados. */
function angleDiff(a1, a2) {
  let diff = Math.abs(a1 - a2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/**
 * Ángulo entre dos líneas (cada una definida por dos puntos), como valor 0-180°.
 * No le importa la dirección de los vectores (línea, no rayo).
 */
export function angleBetweenLines(lineA, lineB) {
  const angA = vectorAngleDeg(lineA[1].x - lineA[0].x, lineA[1].y - lineA[0].y);
  const angB = vectorAngleDeg(lineB[1].x - lineB[0].x, lineB[1].y - lineB[0].y);
  let diff = angleDiff(angA, angB);
  // normalizamos para trabajar siempre con el ángulo "agudo/obtuso" coherente como línea
  return diff;
}

/**
 * Intersección de dos rectas infinitas definidas por dos puntos cada una.
 * Devuelve {x,y} o null si son paralelas.
 */
export function lineIntersection(lineA, lineB) {
  const [p1, p2] = lineA;
  const [p3, p4] = lineB;

  const d1x = p2.x - p1.x, d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x, d2y = p4.y - p3.y;

  const denom = d1x * d2y - d1y * d2x;
  if (Math.abs(denom) < 1e-9) return null;

  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denom;
  return { x: p1.x + t * d1x, y: p1.y + t * d1y };
}

/**
 * Calcula el eje anatómico (línea infinita representada por 2 puntos: los centros)
 * a partir de dos círculos diafisarios.
 */
export function anatomicalAxis(circle1, circle2) {
  return [
    { x: circle1.x, y: circle1.y },
    { x: circle2.x, y: circle2.y },
  ];
}

/**
 * Ángulo, medido desde un punto de pivote, hacia un punto objetivo, tomando
 * el lado de la línea articular en el que cae un punto de referencia "medial".
 *
 * Estrategia robusta: en vez de adivinar por rango numérico, construimos
 * explícitamente el ángulo entre el RAYO del eje anatómico que apunta hacia
 * la articulación, y el RAYO de la línea articular que apunta hacia el lado
 * medial. Ese ángulo (0-180°) es directamente el LDFA o el MPTA clínico.
 *
 * @param axisNearPoint   punto del eje más cercano a la articulación
 * @param axisFarPoint    punto del eje más lejano (hacia la diáfisis)
 * @param articularPoints [pMedial, pLateral] los dos puntos clicados de la línea articular
 */
function clinicalJointAngle(axisNearPoint, axisFarPoint, articularPoints) {
  const [pMedial, pLateral] = articularPoints;

  const axisVec = { x: axisNearPoint.x - axisFarPoint.x, y: axisNearPoint.y - axisFarPoint.y };
  const axisAngle = vectorAngleDeg(axisVec.x, axisVec.y);

  const artVec = { x: pMedial.x - pLateral.x, y: pMedial.y - pLateral.y };
  const artAngleFromLateral = vectorAngleDeg(artVec.x, artVec.y);

  const rawAngle = angleDiff(axisAngle, artAngleFromLateral);

  return rawAngle;
}

/**
 * Calcula los 3 ángulos clínicos: LDFA, MPTA y el ángulo tibiofemoral anatómico.
 *
 * @param femurAxis  [{x,y},{x,y}] eje anatómico femoral, ORDEN: [centro círculo proximal, centro círculo distal]
 * @param femurArticular [pMedial, pLateral] línea articular femoral distal (cóndilos)
 * @param tibiaAxis  [{x,y},{x,y}] eje anatómico tibial, ORDEN: [centro círculo distal, centro círculo proximal]
 * @param tibiaArticular [pMedial, pLateral] línea articular tibial proximal (platillos)
 */
export function computeKneeAngles({ femurAxis, femurArticular, tibiaAxis, tibiaArticular }) {
  const LDFA = clinicalJointAngle(femurAxis[1], femurAxis[0], femurArticular);
  const MPTA = clinicalJointAngle(tibiaAxis[1], tibiaAxis[0], tibiaArticular);

  const rawTF = angleBetweenLines(femurAxis, tibiaAxis);
  const TFangle_straight = rawTF <= 90 ? 180 - rawTF : rawTF;
  const TFangle_deviation = 180 - TFangle_straight;

  return {
    LDFA: round1(LDFA),
    MPTA: round1(MPTA),
    tibiofemoralAnatomic: round1(TFangle_straight),
    tibiofemoralDeviation: round1(TFangle_deviation),
  };
}

function round1(n) {
  return Math.round(n * 10) / 10;
}
