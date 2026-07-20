/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Author {
  name: string;
  role: string;
}

export interface PaperData {
  journal: string;
  publishDate: string;
  doiUrl: string;
  title: string;
  subtitle: string;
  description: string;
  
  introTitle: string;
  introDropcap: string;
  introText1: string;
  introText2: string;
  
  scienceTitle: string;
  scienceText1: string;
  scienceText2: string;
  
  innovationBadge: string;
  innovationTitle: string;
  innovationText1: string;
  innovationText2: string;
  
  resultsTitle: string;
  resultsText: string;
  
  impactTitle: string;
  impactText1: string;
  impactText2: string;
  quote: string;
  quoteAuthor: string;
  
  authors: Author[];

  // Figures Visibility Toggles
  showFigSurfaceCode: boolean;
  showFigTransformer: boolean;
  showFigPerformance: boolean;
  showFigCryostat: boolean;

  // Interactive Diagram 1: Simulator / Core System
  diagram1Title: string;
  diagram1Desc: string;
  diagram1DataLabel: string;
  diagram1StabilizerLabel: string;

  // Interactive Diagram 2: Model Architecture
  diagram2Title: string;
  diagram2Desc: string;
  diagram2InputLabel: string;
  diagram2ModelLabel: string;
  diagram2OutputLabel: string;

  // Interactive Diagram 3: Performance vs Standard
  diagram3Title: string;
  diagram3Desc: string;
  diagram3MetricLabel: string;
  diagram3LabelStandard: string;
  diagram3LabelOurs: string;
  
  // Custom numeric LER values for distance levels
  lerD3Standard: number;
  lerD3Ours: number;
  lerD5Standard: number;
  lerD5Ours: number;
  lerD11Standard: number;
  lerD11Ours: number;
}

export const defaultPaperData: PaperData = {
  journal: "Nature",
  publishDate: "Nov 2024",
  doiUrl: "https://doi.org/10.1038/s41586-024-08148-8",
  title: "AlphaQubit",
  subtitle: "AI for Quantum Error Correction",
  description: "A recurrent, transformer-based neural network that learns to decode the surface code with unprecedented accuracy.",
  
  introTitle: "The Noise Barrier",
  introDropcap: "B",
  introText1: "uilding a large-scale quantum computer requires correcting the errors that inevitably arise in physical systems. The state of the art is the surface code, which encodes information redundantly across many physical qubits.",
  introText2: "However, interpreting the noisy signals from these codes—a task called \"decoding\"—is a massive challenge. Complex noise effects like cross-talk and leakage confuse standard algorithms. AlphaQubit uses machine learning to learn these complex error patterns directly from the quantum processor, achieving accuracy far beyond human-designed algorithms.",
  
  scienceTitle: "The Surface Code",
  scienceText1: "In a surface code, \"Data Qubits\" hold the quantum information, while \"Stabilizer Qubits\" interspersed between them act as watchdogs. They measure parity checks (X and Z type) to detect errors without destroying the quantum state.",
  scienceText2: "When a data qubit flips, adjacent stabilizers light up. The pattern of these lights is the \"syndrome.\" The decoder's job is to look at the syndrome and guess which data qubit flipped.",
  
  innovationBadge: "THE INNOVATION",
  innovationTitle: "Neural Decoding",
  innovationText1: "Standard decoders assume simple, independent errors. Real hardware is messier. AlphaQubit treats decoding as a sequence prediction problem, using a Recurrent Transformer architecture.",
  innovationText2: "It ingests the history of stabilizer measurements and uses \"soft\" analog information—probabilities rather than just binary 0s and 1s—to make highly informed predictions about logical errors.",
  
  resultsTitle: "Outperforming the Standard",
  resultsText: "AlphaQubit was tested on Google's Sycamore processor and accurate simulations. It consistently outperforms \"Minimum-Weight Perfect Matching\" (MWPM), the industry standard, effectively making the quantum computer appear cleaner than it actually is.",
  
  impactTitle: "Towards Fault Tolerance",
  impactText1: "AlphaQubit maintains its advantage even as the code distance increases (up to distance 11). It handles realistic noise including cross-talk and leakage, effects that often cripple standard decoders.",
  impactText2: "By learning from data directly, machine learning decoders can adapt to the unique quirks of each quantum processor, potentially reducing the hardware requirements for useful quantum computing.",
  quote: "Our work illustrates the ability of machine learning to go beyond human-designed algorithms by learning from data directly, highlighting machine learning as a strong contender for decoding in quantum computers.",
  quoteAuthor: "— Bausch et al., Nature (2024)",
  
  authors: [
    { name: "Johannes Bausch", role: "Google DeepMind" },
    { name: "Andrew W. Senior", role: "Google DeepMind" },
    { name: "Francisco J. H. Heras", role: "Google DeepMind" },
    { name: "Thomas Edlich", role: "Google DeepMind" },
    { name: "Alex Davies", role: "Google DeepMind" },
    { name: "Michael Newman", role: "Google Quantum AI" }
  ],

  // Default Visibilities
  showFigSurfaceCode: true,
  showFigTransformer: true,
  showFigPerformance: true,
  showFigCryostat: true,

  // Diagram 1 Defaults
  diagram1Title: "Interactive: Surface Code Detection",
  diagram1Desc: "Click the grey Data Qubits to inject errors. Watch the colored Stabilizers light up when they detect an odd number of errors.",
  diagram1DataLabel: "Data Qubits",
  diagram1StabilizerLabel: "Stabilizers",

  // Diagram 2 Defaults
  diagram2Title: "AlphaQubit Architecture",
  diagram2Desc: "The model processes syndrome history using a recurrent transformer, attending to spatial and temporal correlations.",
  diagram2InputLabel: "Syndrome History",
  diagram2ModelLabel: "Recurrent Transformer",
  diagram2OutputLabel: "Predicted Correction",

  // Diagram 3 Defaults
  diagram3Title: "Performance vs Standard",
  diagram3Desc: "AlphaQubit consistently achieves lower logical error rates (LER) than the standard Minimum-Weight Perfect Matching (MWPM) decoder.",
  diagram3MetricLabel: "LOGICAL ERROR RATE (LOWER IS BETTER)",
  diagram3LabelStandard: "Standard (MWPM)",
  diagram3LabelOurs: "AlphaQubit",

  // Performance default values (%)
  lerD3Standard: 3.5,
  lerD3Ours: 2.9,
  lerD5Standard: 3.6,
  lerD5Ours: 2.75,
  lerD11Standard: 0.0041,
  lerD11Ours: 0.0009
};
