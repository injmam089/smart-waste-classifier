/**
 * Smart Waste Classifier - Waste Guidance Data Module
 * Decoupled, centralized data dictionary providing actionable disposal guidance,
 * safety warnings, and preparation instructions for all waste categories.
 * Follows Phase 5 specifications (FR-11, Section 12).
 */

export const WASTE_DATA = {
  recyclable: {
    id: 'recyclable',
    label: 'Recyclable',
    icon: '♻️',
    badgeClass: 'badge-recyclable',
    summary: 'Items made of clean plastic, paper, cardboard, glass, or metal that can be processed into new materials.',
    preparation: [
      'Empty all liquid and food residue completely.',
      'Lightly rinse and allow to dry where appropriate.',
      'Separate mixed materials (e.g. remove plastic film from cardboard).',
      'Flatten boxes and plastic containers to save bin space.'
    ],
    disposalSteps: [
      'Place in designated dry recyclable / blue bin.',
      'Keep clean and free from food contamination.',
      'Check local recycling numbering (e.g. plastics #1 and #2 are most widely accepted).'
    ],
    warnings: [
      'Do not bag recyclables in dark trash bags unless required by your city.',
      'Not all plastics are universally recyclable in every municipality — verify local facility acceptance.'
    ],
    localRuleNote: 'Municipal recycling capabilities vary widely. When in doubt, follow your local waste authority’s accepted materials list.',
    examples: [
      'PET plastic bottles',
      'Cardboard shipping boxes',
      'Clean paper and newspapers',
      'Aluminum beverage cans',
      'Steel food tins',
      'Glass jars and bottles'
    ]
  },

  organic: {
    id: 'organic',
    label: 'Organic',
    icon: '🌱',
    badgeClass: 'badge-organic',
    summary: 'Biodegradable plant and food waste suitable for composting and natural soil enrichment.',
    preparation: [
      'Remove all plastic stickers, packaging, and twist ties from produce.',
      'Keep separate from non-compostable dry waste and packaging.',
      'Drain excess liquids before depositing in compost bins.'
    ],
    disposalSteps: [
      'Place in dedicated organic/green waste bin or home compost pile.',
      'Layer food scraps with dry leaves or shredded paper in home compost bins for optimal decomposition.',
      'Use certified compostable bags if bags are required by your local collector.'
    ],
    warnings: [
      'Do not include treated wood, vacuum dust, plastic cutlery, or pet waste unless locally approved.',
      'Avoid placing large bones or excessive grease into home compost bins as they attract pests.'
    ],
    localRuleNote: 'Composting programs differ by community. Check whether your local organic collection accepts dairy, meat, or certified compostable packaging.',
    examples: [
      'Fruit and vegetable scraps',
      'Coffee grounds and paper filters',
      'Tea leaves',
      'Eggshells',
      'Garden trimmings and leaves',
      'Shredded untreated paper'
    ]
  },

  ewaste: {
    id: 'ewaste',
    label: 'E-Waste',
    icon: '🔋',
    badgeClass: 'badge-ewaste',
    summary: 'Electrical and electronic equipment containing recoverable precious metals and hazardous components.',
    preparation: [
      'Perform a factory reset and delete personal data from smartphones and computers.',
      'Do not dismantle or crush devices; keep housings intact.',
      'Tape over exposed battery terminals with non-conductive electrical tape.'
    ],
    disposalSteps: [
      'Take to an authorized municipal e-waste recycling depot or retailer take-back event.',
      'Drop rechargeable batteries into dedicated battery collection kiosks at local hardware/electronics stores.',
      'Donate functional electronics in good working condition to charitable organizations.'
    ],
    warnings: [
      'NEVER dispose of electronics or batteries in regular household trash bins.',
      'NEVER burn electronic waste or wire insulation — burning releases toxic dioxins, lead, and hazardous fumes.',
      'DO NOT puncture, crush, or open lithium-ion batteries or electronic housings, as this can spark intense chemical fires.'
    ],
    localRuleNote: 'Electronic waste is strictly regulated in most jurisdictions. Look for certified e-Stewards or R2-certified recyclers.',
    examples: [
      'Mobile phones and tablets',
      'Charging cables and power adapters',
      'Lithium-ion and alkaline batteries',
      'Laptops and computer accessories',
      'Earbuds and headphones',
      'Small household electric appliances'
    ]
  },

  unknown: {
    id: 'unknown',
    label: 'Uncategorized Waste',
    icon: '📦',
    badgeClass: 'badge-uncertain',
    summary: 'Item category could not be definitively matched to standard recycling, organic, or e-waste streams.',
    preparation: [
      'Inspect manufacturer packaging for material identification symbols.',
      'Keep item separate until proper disposal method is confirmed.'
    ],
    disposalSteps: [
      'Check local municipal waste management sorting directory.',
      'If item contains hazardous chemicals, paint, or solvents, take to a Household Hazardous Waste (HHW) center.',
      'When material composition is unknown, avoid contaminating clean recycling streams.'
    ],
    warnings: [
      'Do not mix unknown chemicals or batteries with common waste.',
      'Do not burn unknown waste materials.'
    ],
    localRuleNote: 'Consult your municipal waste management guideline for specialty and hard-to-recycle items.',
    examples: [
      'Mixed multi-layer packaging',
      'Treated composite materials',
      'Unidentified household items'
    ]
  }
};

/**
 * Returns complete disposal guidance data for a given waste category.
 * Gracefully falls back to 'unknown' if category is invalid or missing.
 *
 * @param {string} categoryKey e.g. 'recyclable', 'organic', 'ewaste', 'eWaste'
 * @returns {typeof WASTE_DATA.recyclable}
 */
export function getWasteGuidance(categoryKey) {
  if (!categoryKey || typeof categoryKey !== 'string') {
    return WASTE_DATA.unknown;
  }

  const normalized = categoryKey.trim().toLowerCase();

  if (normalized === 'recyclable' || normalized.includes('recycl')) {
    return WASTE_DATA.recyclable;
  }
  if (normalized === 'organic' || normalized.includes('organ')) {
    return WASTE_DATA.organic;
  }
  if (normalized === 'ewaste' || normalized === 'e-waste' || normalized.includes('waste')) {
    return WASTE_DATA.ewaste;
  }

  return WASTE_DATA.unknown;
}
