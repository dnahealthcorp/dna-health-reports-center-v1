
export const predefinedOptions = {
  glucoseMetabolism: [
    "<p>Optimal glucose metabolism.</p>",
    "<p>Elevated HbA1c of [xxx]%, with high fasting glucose, indicates a prediabetic state, accompanied by low QUICKI and dHOMA2-S scores, suggestive of insulin resistance.</p><p><strong>Contributing Factors:</strong></p><ul><li>High intake of refined carbohydrates</li><li>Irregular and late meal timing</li><li>Elevated cortisol levels</li></ul>"
  ],
  proteins: [
    "<p>All protein markers within optimal range.</p>",
    "<p>Albumin slightly below optimal, indicating potential nutritional deficiency.</p>"
  ],
  lipidProfile: [
    "<p>Optimal lipid profile.</p>",
    "<p>Elevated total cholesterol (TC) and LDL, with normal HDL and triglycerides.</p>",
    "<p>Low HDL with elevated triglycerides, suggesting metabolic syndrome pattern.</p>"
  ],
  inflammation: [
    "<p>No signs of systemic inflammation.</p>",
    "<p>Elevated high-sensitivity CRP indicating low-grade inflammation.</p>"
  ],
  metabolic: [
    "<p>Metabolic markers within normal ranges.</p>",
    "<p>Multiple metabolic markers outside optimal ranges, suggesting metabolic stress.</p>"
  ],
  homocysteine: [
    "<p>Homocysteine within optimal range.</p>",
    "<p>Elevated homocysteine levels indicating potential methylation issues.</p>"
  ],
  vitaminsMinerals: [
    "<p>Optimal vitamin and mineral status.</p>",
    "<p>Vitamin D deficiency with suboptimal magnesium levels.</p>"
  ],
  ironProfile: [
    "<p>Iron markers within optimal ranges.</p>",
    "<p>Elevated ferritin with normal iron suggests inflammatory process.</p>"
  ],
  sexHormones: [
    "<p>Sex hormones within age-appropriate ranges.</p>",
    "<p>Low testosterone with elevated estradiol, suggesting aromatase activity.</p>"
  ],
  kidneyFunctionElectrolytes: [
    "<p>Kidney function and electrolytes within normal limits.</p>",
    "<p>Elevated BUN and creatinine suggesting reduced kidney function.</p>"
  ],
  liverFunctions: [
    "<p>Liver enzymes within optimal ranges.</p>",
    "<p>Mildly elevated AST and ALT suggesting hepatic stress.</p>"
  ],
  tumorMarkers: [
    "<p>All tumor markers within normal range.</p>",
    "<p>Slightly elevated PSA requiring follow-up.</p>"
  ],
  bloodCounts: [
    "<p>Complete blood count within normal parameters.</p>",
    "<p>Mild anemia with reduced hemoglobin and hematocrit.</p>"
  ]
};

export const getFormattedFieldName = (field: string) => {
  return field === 'glucoseMetabolism' ? 'Glucose Metabolism' : 
         field === 'vitaminsMinerals' ? 'Vitamins/Minerals' : 
         field === 'ironProfile' ? 'Iron Profile' : 
         field === 'sexHormones' ? 'Sex Hormones' : 
         field === 'kidneyFunctionElectrolytes' ? 'Kidney Function and Electrolytes' : 
         field === 'liverFunctions' ? 'Liver Functions' : 
         field === 'tumorMarkers' ? 'Tumor Markers' : 
         field === 'bloodCounts' ? 'Blood Counts' : 
         field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export type SummaryFindingFieldType = keyof typeof predefinedOptions;

