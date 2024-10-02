function computeTF(word: string, document: string): number {
  let wordCount = 0;
  const words: string[] = document.toLowerCase().split(" ");
  words.forEach((w) => {
    if (w === word) {
      wordCount++;
    }
  });
  return wordCount / words.length;
}

function computeIDF(word: string, allDocuments: string[]): number {
  let numDocsContainingWord = 0;
  allDocuments.forEach((document) => {
    document = document.toLowerCase();
    if (document.includes(word.toLowerCase())) {
      numDocsContainingWord++;
    }
  });
  return Math.log(allDocuments.length / numDocsContainingWord);
}

function computeTFIDF(
  word: string,
  document: string,
  allDocuments: string[]
): number {
  const tf = computeTF(word, document);
  const idf = computeIDF(word, allDocuments);
  return tf * idf;
}

// Tính TF-IDF cho tất cả từ trong tài liệu
function computeAllTFIDF(
  document: string,
  allDocuments: string[]
): Record<string, number> {
  const words: string[] = [...new Set(document.toLowerCase().split(" "))]; // Xóa từ trùng lặp
  const tfidfScores: Record<string, number> = {};

  words.forEach((word) => {
    tfidfScores[word] = computeTFIDF(word, document, allDocuments);
  });

  return tfidfScores;
}

export default {
    computeAllTFIDF,
    computeTFIDF
}
