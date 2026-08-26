# MemScope Design Directions

## Three stylistic approaches

| Theme Name | Very Brief Intro | Probability |
|---|---|---:|
| Signal Archive | A sober, archival research console that makes complex memory signals feel inspectable and calm. It treats each process as a case file rather than a generic metric source. | 0.06 |
| Kernel Field Notes | A technical notebook aesthetic with utility typography, annotated plots, and structured observation panels. It conveys an expert's working environment rather than a consumer dashboard. | 0.09 |
| Infrared Observatory | A dark instrument-panel system inspired by laboratory equipment and old terminal phosphors, with carefully placed spectral accents for anomaly states. | 0.04 |

## Chosen approach: Kernel Field Notes

### Design Movement

**Technical editorialism** — a hybrid of a research lab notebook, systems profiler, and modern developer tooling. The interface should look like an investigator’s active field record: evidence-led, legible, and deliberately dense without becoming claustrophobic.

### Core Principles

1. **Evidence before decoration:** Data, provenance labels, and diagnostic context establish hierarchy.
2. **Layered inspection:** A left navigation rail, an operational command bar, and stacked analytical canvases mimic moving from process selection to subsystem evidence.
3. **Quiet precision:** Muted structural colors ensure anomaly accents earn attention rather than compete for it.
4. **Readable density:** Mono labels and numeric readings work with a high-legibility sans serif for swift scanning.

### Color Philosophy

The base is warm graphite and blue-black ink, reminiscent of a physical instrument panel rather than a glossy SaaS dark mode. A near-luminous **signal lime** indicates healthy observation and selected telemetry, while amber calls attention to investigation and muted coral indicates an actionable leak suspicion. The palette should feel analytical, not alarmist.

### Layout Paradigm

The application uses a **case-file workbench**: a persistent vertical evidence rail at the left, a compact command/status header across the top, and an offset, masonry-like investigation canvas. The central time-series panel acts as the primary specimen; surrounding panels read like clipped field notes attached around it. Information is aligned to a measured 8px rhythm, but main content is intentionally asymmetric.

### Signature Elements

1. **Calibration ticks:** Small mono scales and ticks around plots, headers, and selected values.
2. **Observation tags:** Boxed section labels such as `OBSERVATION 01` and `PROCFS / 5s` that establish investigative context.
3. **Trace threads:** Fine lime or amber lines that connect a metric to its interpretation or flagged state.

### Interaction Philosophy

Interactions should resemble adjusting a diagnostic instrument. Selected controls gain a crisp outline and a short status response; hover states reveal metadata rather than distracting effects. Tab switches and process changes replace the displayed evidence immediately, while the simulated collection state remains visibly live.

### Animation

Only subtle transform and opacity transitions are used. Cards rise by 1–2px on hover, live telemetry dots pulse slowly, and newly selected evidence panels fade/slide in over 180–220ms using a sharp ease-out. Charts should not continuously animate their geometry; line emphasis changes only on selection. All decorative motion is disabled for reduced-motion preferences.

### Typography System

**Space Grotesk** is the primary interface face, with strong semi-bold headings and clean regular-copy labels. **IBM Plex Mono** is used for metric values, process identifiers, timestamps, paths, and diagnostic tags. Editorial labels remain uppercase with controlled tracking; value hierarchy comes from size and tabular numerals, not oversized type.

### Brand Essence

**MemScope is a focused Linux memory investigation workbench for engineers who need to explain process behavior, not merely watch it.**

Personality: **forensic, composed, exacting**.

### Brand Voice

Headlines are declarative and evidence-oriented. CTAs are commands, not marketing prompts. Microcopy says what was observed, when it was observed, and why it matters.

Examples:

> Memory drift isolated in the allocator path.

> Pin this interval for comparison.

### Wordmark & Logo

The mark is a cropped memory-map bracket containing three stacked trace segments, suggesting a process boundary and sampled pages. The MemScope wordmark uses a wide, slightly technical geometric treatment with a distinct `M` built from linked address blocks; it must never read as default body text.

### Signature Brand Color

**Signal Lime — `#C6FF4A`**. It is reserved for active scope, live telemetry, and positive analytical focus.
