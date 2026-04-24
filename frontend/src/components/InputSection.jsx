import { useState } from 'react';

export default function InputSection({ onSubmit, isLoading }) {
  const [input, setInput] = useState('');

  const handleLoadSample = () => {
    const sample = [
      "A->B", "A->C", "B->D", "C->E", "E->F",
      "X->Y", "Y->Z", "Z->X",
      "P->Q", "Q->R",
      "G->H", "G->H", "G->I",
      "hello", "1->2", "A->"
    ].join(',\n');
    setInput(sample);
  };

  const handleSubmit = () => {
    if (!input.trim()) return;

    const rawItems = input.split(/,|\n/);
    const dataArray = rawItems
      .map(item => item.trim())
      .filter(item => item.length > 0);

    onSubmit(dataArray);
  };

  return (
    <div className="card">
      <h2>Input Data</h2>
      <div className="input-area">
        <p className="subtitle" style={{ fontSize: '0.875rem', marginTop: '-0.5rem' }}>
          Enter edges format like "A-&gt;B". Separate by comma or newline.
        </p>
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="A->B, A->C&#10;B->D"
        />
        <div className="button-group">
          <button className="secondary" onClick={handleLoadSample} disabled={isLoading}>
            Load Sample
          </button>
          <button onClick={handleSubmit} disabled={isLoading || !input.trim()}>
            {isLoading ? 'Processing...' : 'Analyze'}
          </button>
        </div>
      </div>
    </div>
  );
}
