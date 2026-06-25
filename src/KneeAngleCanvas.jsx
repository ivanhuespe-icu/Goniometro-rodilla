import { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Circle, Line, Group, Text, Rect } from 'react-konva';
import {
  circleFrom3Points,
  anatomicalAxis,
  computeKneeAngles,
  lineIntersection,
  angleArcPoints,
  NORMAL_RANGES,
} from './geometry.js';
import { STEPS, TOTAL_STEPS } from './measurementSteps.js';

const COLORS = {
  femur: '#5ec8e8',
  tibia: '#f5c84c',
  articular: '#ff5d73',
  point: '#ffffff',
  pointActive: '#34d399',
};

const MAX_CANVAS_WIDTH = 720;
const MAX_CANVAS_HEIGHT = 720;

function useImageLoader(src) {
  const [img, setImg] = useState(null);
  useEffect(() => {
    if (!src) {
      setImg(null);
      return;
    }
    const image = new window.Image();
    image.onload = () => setImg(image);
    image.src = src;
  }, [src]);
  return img;
}

export default function KneeAngleCanvas() {
  const [imageSrc, setImageSrc] = useState(null);
  const image = useImageLoader(imageSrc);

  // Estado de pasos: para cada step.id, guardamos los puntos clickeados { x, y }
  const [stepData, setStepData] = useState({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activePointDrag, setActivePointDrag] = useState(null); // {stepId, pointIndex}

  const fileInputRef = useRef(null);

  const stageSize = (() => {
    if (!image) return { width: MAX_CANVAS_WIDTH, height: MAX_CANVAS_HEIGHT };
    const ratio = Math.min(MAX_CANVAS_WIDTH / image.width, MAX_CANVAS_HEIGHT / image.height, 1);
    return { width: image.width * ratio, height: image.height * ratio, scale: ratio };
  })();

  const currentStep = STEPS[currentStepIndex] || null;
  const isComplete = currentStepIndex >= TOTAL_STEPS;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageSrc(ev.target.result);
      setStepData({});
      setCurrentStepIndex(0);
    };
    reader.readAsDataURL(file);
  };

  const handleStageClick = useCallback(
    (e) => {
      if (!currentStep || isComplete) return;
      // Evitar registrar un click si en realidad fue el fin de un drag de un punto existente
      if (activePointDrag) return;
      // Evitar registrar un click si el usuario clickeó sobre una figura ya dibujada
      // (un punto arrastrable, un círculo, una línea) en vez del fondo/imagen.
      // En Konva, e.target es la forma específica clickeada; el fondo es el KonvaImage o el Stage mismo.
      const targetClassName = e.target.getClassName?.();
      if (targetClassName && targetClassName !== 'Image' && targetClassName !== 'Stage') {
        return;
      }

      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      setStepData((prev) => {
        const existing = prev[currentStep.id]?.points || [];
        if (existing.length >= currentStep.clicksNeeded) return prev;
        const updated = [...existing, { x: pointer.x, y: pointer.y }];
        return { ...prev, [currentStep.id]: { points: updated } };
      });
    },
    [currentStep, isComplete, activePointDrag]
  );

  // Avanzar automáticamente de paso SOLO en el instante en que se completan
  // los clics necesarios (transición de incompleto -> completo), no cada vez
  // que el usuario navega de vuelta a un paso que ya estaba completo.
  const prevCountRef = useRef(0);
  useEffect(() => {
    if (!currentStep) return;
    const pts = stepData[currentStep.id]?.points || [];
    const justCompleted = pts.length === currentStep.clicksNeeded && prevCountRef.current < currentStep.clicksNeeded;
    prevCountRef.current = pts.length;
    if (justCompleted) {
      const t = setTimeout(() => setCurrentStepIndex((i) => i + 1), 150);
      return () => clearTimeout(t);
    }
  }, [stepData, currentStep]);

  // Cuando el usuario navega manualmente a otro paso, resetear el contador de
  // referencia con los puntos que ese paso ya tenga, para no disparar un
  // avance automático espurio al llegar.
  useEffect(() => {
    prevCountRef.current = currentStep ? (stepData[currentStep.id]?.points || []).length : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex]);

  const updatePoint = (stepId, pointIndex, newPos) => {
    setStepData((prev) => {
      const pts = [...(prev[stepId]?.points || [])];
      pts[pointIndex] = newPos;
      return { ...prev, [stepId]: { points: pts } };
    });
  };

  const goToStep = (idx) => setCurrentStepIndex(idx);

  const clearStep = (stepId) => {
    setStepData((prev) => {
      const next = { ...prev };
      delete next[stepId];
      return next;
    });
  };

  const resetAll = () => {
    setStepData({});
    setCurrentStepIndex(0);
  };

  // --- Derivar geometría a partir de stepData ---
  const getPts = (id) => stepData[id]?.points || [];

  const femurProxCircle = getPts('femur-prox-circle').length === 3 ? circleFrom3Points(...getPts('femur-prox-circle')) : null;
  const femurDistCircle = getPts('femur-dist-circle').length === 3 ? circleFrom3Points(...getPts('femur-dist-circle')) : null;
  const tibiaProxCircle = getPts('tibia-prox-circle').length === 3 ? circleFrom3Points(...getPts('tibia-prox-circle')) : null;
  const tibiaDistCircle = getPts('tibia-dist-circle').length === 3 ? circleFrom3Points(...getPts('tibia-dist-circle')) : null;

  const femurArticularPts = getPts('femur-articular');
  const tibiaArticularPts = getPts('tibia-articular');

  const femurAxis = femurProxCircle && femurDistCircle ? anatomicalAxis(femurProxCircle, femurDistCircle) : null;
  const tibiaAxis = tibiaDistCircle && tibiaProxCircle ? anatomicalAxis(tibiaDistCircle, tibiaProxCircle) : null;

  let angles = null;
  if (femurAxis && tibiaAxis && femurArticularPts.length === 2 && tibiaArticularPts.length === 2) {
    angles = computeKneeAngles({
      femurAxis,
      femurArticular: femurArticularPts,
      tibiaAxis,
      tibiaArticular: tibiaArticularPts,
    });
  }

  // Radio del arco proporcional al tamaño de la imagen en pantalla, para que
  // se vea bien tanto en radiografías grandes como chicas.
  const arcRadius = Math.max(28, Math.min(stageSize.width, stageSize.height) * 0.06);

  // Distancia máxima razonable entre el vértice calculado y los puntos clicados
  // por el usuario; si la intersección matemática cae mucho más lejos que esto
  // (caso patológico: eje casi paralelo a la articular), no dibujamos el arco
  // para evitar que la etiqueta aparezca disparada en cualquier lugar de la imagen.
  const maxVertexDistance = Math.max(stageSize.width, stageSize.height) * 1.5;

  // --- Arco visual de LDFA: vértice = intersección eje femoral × línea articular femoral ---
  let ldfaArc = null;
  if (femurAxis && femurArticularPts.length === 2) {
    const vertex = lineIntersection(femurAxis, femurArticularPts);
    if (vertex && Math.hypot(vertex.x - femurAxis[1].x, vertex.y - femurAxis[1].y) < maxVertexDistance) {
      // Rayo 1: hacia el centro del círculo distal (la diáfisis femoral, "hacia arriba")
      // Rayo 2: hacia el punto medial de la línea articular (el lado clínicamente medido)
      const { points, labelPoint } = angleArcPoints(vertex, femurAxis[0], femurArticularPts[0], arcRadius);
      ldfaArc = { points, labelPoint, vertex };
    }
  }

  // --- Arco visual de MPTA: vértice = intersección eje tibial × línea articular tibial ---
  let mptaArc = null;
  if (tibiaAxis && tibiaArticularPts.length === 2) {
    const vertex = lineIntersection(tibiaAxis, tibiaArticularPts);
    if (vertex && Math.hypot(vertex.x - tibiaAxis[1].x, vertex.y - tibiaAxis[1].y) < maxVertexDistance) {
      const { points, labelPoint } = angleArcPoints(vertex, tibiaAxis[0], tibiaArticularPts[0], arcRadius);
      mptaArc = { points, labelPoint, vertex };
    }
  }

  // --- Arco visual del ángulo tibiofemoral: vértice = centro anatómico de la rodilla ---
  // Nota: NO usamos la intersección matemática de las dos rectas infinitas, porque cuando
  // los ejes están casi alineados (ángulo cercano a 180°, como es normal en una rodilla)
  // esa intersección puede caer muy lejos de la rodilla real. En cambio, usamos el punto
  // medio entre el centro del círculo femoral distal y el centro del círculo tibial proximal:
  // ambos representan la zona articular real, que es donde clínicamente se "ve" este ángulo.
  let tfArc = null;
  if (femurAxis && tibiaAxis) {
    const vertex = {
      x: (femurAxis[1].x + tibiaAxis[1].x) / 2,
      y: (femurAxis[1].y + tibiaAxis[1].y) / 2,
    };
    // Rayo 1: hacia la diáfisis femoral (arriba). Rayo 2: hacia la diáfisis tibial (abajo).
    const { points, labelPoint } = angleArcPoints(vertex, femurAxis[0], tibiaAxis[0], arcRadius * 1.3);
    tfArc = { points, labelPoint, vertex };
  }

  // Líneas extendidas para que se vean cruzando toda la imagen (estética tipo software de planificación)
  const extendLine = (p1, p2, factor = 4) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return [
      { x: p1.x - dx * factor, y: p1.y - dy * factor },
      { x: p2.x + dx * factor, y: p2.y + dy * factor },
    ];
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">⊕</span>
          <div>
            <h1>Goniómetro digital de rodilla</h1>
            <p className="subtitle">Trazado de ejes anatómicos · LDFA · MPTA · ángulo tibiofemoral</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={resetAll} disabled={!image}>
            Reiniciar trazado
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="canvas-panel">
          {!image ? (
            <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div className="upload-icon">⊕</div>
              <p className="upload-title">Subir radiografía de rodilla (AP)</p>
              <p className="upload-hint">PNG o JPG · una rodilla por imagen</p>
            </div>
          ) : (
            <>
              <div className="canvas-wrapper" style={{ width: stageSize.width, height: stageSize.height }}>
                <Stage
                  width={stageSize.width}
                  height={stageSize.height}
                  onClick={handleStageClick}
                  onTap={handleStageClick}
                >
                  <Layer>
                    <KonvaImage image={image} width={stageSize.width} height={stageSize.height} />

                    {/* Círculos diafisarios */}
                    {[
                      { circle: femurProxCircle, color: COLORS.femur },
                      { circle: femurDistCircle, color: COLORS.femur },
                      { circle: tibiaProxCircle, color: COLORS.tibia },
                      { circle: tibiaDistCircle, color: COLORS.tibia },
                    ].map(
                      (c, idx) =>
                        c.circle && (
                          <Circle
                            key={`circ-${idx}`}
                            x={c.circle.x}
                            y={c.circle.y}
                            radius={c.circle.r}
                            stroke={c.color}
                            strokeWidth={1.5}
                            dash={[6, 4]}
                            fillEnabled={false}
                          />
                        )
                    )}
                    {/* Centros de los círculos, marcados */}
                    {[femurProxCircle, femurDistCircle, tibiaProxCircle, tibiaDistCircle].map(
                      (c, idx) =>
                        c && <Circle key={`center-${idx}`} x={c.x} y={c.y} radius={3} fill="#fff" />
                    )}

                    {/* Eje anatómico femoral */}
                    {femurAxis && (
                      <Line
                        points={extendLine(femurAxis[0], femurAxis[1]).flatMap((p) => [p.x, p.y])}
                        stroke={COLORS.femur}
                        strokeWidth={2}
                      />
                    )}
                    {/* Eje anatómico tibial */}
                    {tibiaAxis && (
                      <Line
                        points={extendLine(tibiaAxis[0], tibiaAxis[1]).flatMap((p) => [p.x, p.y])}
                        stroke={COLORS.tibia}
                        strokeWidth={2}
                      />
                    )}

                    {/* Línea articular femoral */}
                    {femurArticularPts.length === 2 && (
                      <Line
                        points={extendLine(femurArticularPts[0], femurArticularPts[1], 1.4).flatMap((p) => [p.x, p.y])}
                        stroke={COLORS.articular}
                        strokeWidth={2}
                      />
                    )}
                    {/* Línea articular tibial */}
                    {tibiaArticularPts.length === 2 && (
                      <Line
                        points={extendLine(tibiaArticularPts[0], tibiaArticularPts[1], 1.4).flatMap((p) => [p.x, p.y])}
                        stroke={COLORS.articular}
                        strokeWidth={2}
                      />
                    )}

                    {/* Arcos y etiquetas de ángulo, dibujados directamente sobre la radiografía */}
                    {[
                      { arc: ldfaArc, value: angles?.LDFA, key: 'LDFA', rangeKey: 'LDFA', color: COLORS.femur },
                      { arc: mptaArc, value: angles?.MPTA, key: 'MPTA', rangeKey: 'MPTA', color: COLORS.tibia },
                      {
                        arc: tfArc,
                        value: angles?.tibiofemoralAnatomic,
                        key: 'Ángulo TF',
                        rangeKey: 'tibiofemoralAnatomic',
                        color: COLORS.articular,
                      },
                    ].map(({ arc, value, key, rangeKey, color }) => {
                      if (!arc || value == null) return null;
                      const labelText = `${key} = ${value}°\n(${NORMAL_RANGES[rangeKey]})`;
                      // Estimación simple del tamaño del fondo según longitud del texto
                      const lines = labelText.split('\n');
                      const longestLine = Math.max(...lines.map((l) => l.length));
                      const boxWidth = longestLine * 7.2 + 12;
                      const boxHeight = lines.length * 16 + 8;
                      return (
                        <Group key={key}>
                          <Line
                            points={arc.points.flatMap((p) => [p.x, p.y])}
                            stroke={color}
                            strokeWidth={2.5}
                            lineCap="round"
                            lineJoin="round"
                          />
                          <Rect
                            x={arc.labelPoint.x - boxWidth / 2}
                            y={arc.labelPoint.y - boxHeight / 2 - 2}
                            width={boxWidth}
                            height={boxHeight}
                            fill="#0b0e12"
                            opacity={0.78}
                            cornerRadius={4}
                            stroke={color}
                            strokeWidth={1}
                          />
                          <Text
                            x={arc.labelPoint.x}
                            y={arc.labelPoint.y}
                            text={labelText}
                            fontSize={13}
                            fontFamily="'IBM Plex Mono', monospace"
                            fontStyle="600"
                            fill="#ffffff"
                            align="center"
                            offsetX={boxWidth / 2 - 6}
                            offsetY={boxHeight / 2 - 4}
                          />
                        </Group>
                      );
                    })}

                    {/* Puntos arrastrables, por cada step ya con datos */}
                    {STEPS.map((step) =>
                      (stepData[step.id]?.points || []).map((pt, pIdx) => (
                        <Group key={`${step.id}-${pIdx}`}>
                          <Circle
                            x={pt.x}
                            y={pt.y}
                            radius={6}
                            fill={
                              step.kind === 'line'
                                ? COLORS.articular
                                : step.bone === 'femur'
                                ? COLORS.femur
                                : COLORS.tibia
                            }
                            stroke="#fff"
                            strokeWidth={1}
                            draggable
                            onDragStart={() => setActivePointDrag({ stepId: step.id, pointIndex: pIdx })}
                            onDragMove={(e) => {
                              updatePoint(step.id, pIdx, { x: e.target.x(), y: e.target.y() });
                            }}
                            onDragEnd={() => setActivePointDrag(null)}
                          />
                        </Group>
                      ))
                    )}
                  </Layer>
                </Stage>
              </div>
            </>
          )}
        </section>

        <aside className="side-panel">
          {image && !isComplete && currentStep && (
            <div className="step-card">
              <div className="step-counter">
                Paso {currentStepIndex + 1} de {TOTAL_STEPS}
              </div>
              <h2 className="step-label">{currentStep.label}</h2>
              <p className="step-instruction">{currentStep.instruction}</p>
              <div className="step-progress-dots">
                {Array.from({ length: currentStep.clicksNeeded }).map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${
                      (stepData[currentStep.id]?.points || []).length > i ? 'dot-filled' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {image && (
            <div className="steps-nav">
              <h3>Pasos del trazado</h3>
              <ol>
                {STEPS.map((step, idx) => {
                  const pts = stepData[step.id]?.points || [];
                  const done = pts.length === step.clicksNeeded;
                  return (
                    <li
                      key={step.id}
                      className={`nav-item ${idx === currentStepIndex ? 'active' : ''} ${done ? 'done' : ''}`}
                    >
                      <span className="nav-status">{done ? '✓' : idx + 1}</span>
                      <span className="nav-label" onClick={() => goToStep(idx)}>
                        {step.label}
                      </span>
                      {pts.length > 0 && (
                        <button
                          className="nav-clear"
                          title="Borrar puntos de este paso y volver a clickear"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            clearStep(step.id);
                            goToStep(idx);
                          }}
                        >
                          ↺
                        </button>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {angles && (
            <div className="results-card">
              <h3>Resultados</h3>
              <div className="result-row">
                <span className="result-label">LDFA (eje femoral / articular)</span>
                <span className="result-value">{angles.LDFA}°</span>
              </div>
              <div className="result-row">
                <span className="result-label">MPTA (eje tibial / articular)</span>
                <span className="result-value">{angles.MPTA}°</span>
              </div>
              <div className="result-row">
                <span className="result-label">Ángulo tibiofemoral anatómico</span>
                <span className="result-value">{angles.tibiofemoralAnatomic}°</span>
              </div>
              <div className="result-row subtle">
                <span className="result-label">Desviación respecto a 180°</span>
                <span className="result-value">{angles.tibiofemoralDeviation}°</span>
              </div>
              <p className="results-note">
                Todos los puntos son arrastrables: ajustá cualquier marcador sobre la imagen para
                refinar la medición. Los valores se recalculan en vivo.
              </p>
            </div>
          )}

          {image && (
            <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
              Cambiar imagen
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </aside>
      </main>

      <footer className="app-footer">
        Herramienta de apoyo a la medición — no reemplaza el criterio clínico ni la validación
        por un profesional. Verificá siempre los puntos trazados sobre la imagen original.
      </footer>
    </div>
  );
}
