// Base URL of LibreTranslate server. Some public instances are listed at
// https://docs.libretranslate.com/community/mirrors/. You can change the
// hostname here if one becomes unavailable or requires an API key.
const API_HOST = 'https://lt.blitzw.in';

// Utility function to swap source and target languages in text translation
function swapLanguages() {
  const srcSelect = document.getElementById('sourceLang');
  const tgtSelect = document.getElementById('targetLang');
  const tmp = srcSelect.value;
  srcSelect.value = tgtSelect.value;
  tgtSelect.value = tmp;
}

// Perform text translation
async function translateText() {
  const text = document.getElementById('sourceText').value.trim();
  const source = document.getElementById('sourceLang').value;
  const target = document.getElementById('targetLang').value;
  const resultDiv = document.getElementById('textResult');
  if (!text) {
    resultDiv.textContent = 'Please enter text to translate.';
    return;
  }
  resultDiv.textContent = 'Translating...';
  try {
    const response = await fetch(`${API_HOST}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: source,
        target: target
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    if (data.translatedText) {
      resultDiv.textContent = data.translatedText;
    } else {
      resultDiv.textContent = 'Unexpected response: ' + JSON.stringify(data);
    }
  } catch (err) {
    resultDiv.textContent = 'Translation failed: ' + err.message;
  }
}

// Perform PDF file translation
async function translateFile() {
  const fileInput = document.getElementById('fileInput');
  const source = document.getElementById('sourceLangFile').value;
  const target = document.getElementById('targetLangFile').value;
  const resultDiv = document.getElementById('fileResult');
  if (!fileInput.files || fileInput.files.length === 0) {
    resultDiv.textContent = 'Please choose a PDF file.';
    return;
  }
  const file = fileInput.files[0];
  if (file.type !== 'application/pdf') {
    resultDiv.textContent = 'Selected file must be a PDF.';
    return;
  }
  resultDiv.textContent = 'Uploading and translating...';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('source', source);
  formData.append('target', target);
  try {
    const response = await fetch(`${API_HOST}/translate_file`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    if (data.translatedFileUrl) {
      resultDiv.innerHTML = '';
      const link = document.createElement('a');
      link.href = data.translatedFileUrl;
      link.textContent = 'Download translated PDF';
      link.target = '_blank';
      resultDiv.appendChild(link);
    } else if (data.error) {
      resultDiv.textContent = 'Error: ' + data.error;
    } else {
      resultDiv.textContent = 'Unexpected response: ' + JSON.stringify(data);
    }
  } catch (err) {
    resultDiv.textContent = 'File translation failed: ' + err.message;
  }
}

// Attach event listeners after DOM content loaded
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('swapLang').addEventListener('click', swapLanguages);
  document.getElementById('translateBtn').addEventListener('click', translateText);
  document
    .getElementById('translateFileBtn')
    .addEventListener('click', translateFile);
});