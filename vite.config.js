import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const defectSelect = `<div className="field"><label>Defect</label><select value={f.defect} onChange={e=>u('defect',e.target.value)}><option value="">Select defect</option><optgroup label="Print"><option>Print – Colour</option><option>Print – Text</option><option>Print – Position or Label on Transfer Film</option></optgroup><optgroup label="Cleanliness"><option>Clean – Dust</option><option>Clean – Soil / Dirt / Grease</option></optgroup><optgroup label="Product"><option>Deviation Weight</option><option>Fill Height Variation</option><option>Foreign Bodies</option><option>Product Appearance</option><option>Print – Colour / Texture / Deformation</option></optgroup><optgroup label="Assembly"><option>Assembly Missing (N/A)</option><option>Assembly Wrong (N/A)</option><option>Dislocation</option><option>Sharp Edges (N/A)</option></optgroup><optgroup label="Closure"><option>Sachet String – Perforation</option><option>Seal – Align</option><option>Seal – Burn</option><option>Seal – Damage</option><option>Seal – Joining</option><option>Wrinkle–Overpressing/Integrity (N/A)</option></optgroup><optgroup label="Condition"><option>Blown / Inflated Pack</option></optgroup><optgroup label="Damage"><option>Damage – Crush/Cut/Corner/Tear</option><option>Damage – Puncture</option><option>Damage – Scratches/Scuffing</option></optgroup><optgroup label="Opening Device"><option>Loose Fit (N/A)</option><option>Flour Damaged (N/A)</option><option>Tear Notch</option><option>Tear Strip (N/A)</option></optgroup><optgroup label="Date Code"><option>Readability / Missing / Position</option></optgroup><optgroup label="Production Code"><option>Missing / Illegible / Position</option></optgroup><optgroup label="Aesthetics"><option>Foreign Material</option><option>Spillage</option><option>Air Pocket</option><option>Colour Difference</option><option>Plastic Separation</option></optgroup></select></div>`;

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'grouped-quality-defects',
      transform(code, id) {
        if (!id.endsWith('/src/main.jsx')) return null;
        const target = '<div className="field"><label>Defect</label><input value={f.defect} onChange={e=>u(\'defect\',e.target.value)} placeholder="Enter defect"/></div>';
        if (!code.includes(target)) return null;
        return { code: code.replace(target, defectSelect), map: null };
      }
    }
  ]
});
