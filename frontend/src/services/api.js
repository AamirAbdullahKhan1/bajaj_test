const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const analyzeHierarchy = async (dataArray) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bfhl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: dataArray }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
