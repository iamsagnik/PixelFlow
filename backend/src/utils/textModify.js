import { stopWords } from "./StopWords";
import { synonymMap } from "./SynonymMap";
import pluralize from 'pluralize-esm';

const modifiedTextArray = (text) => {
  const cleanText = text.replace(/[^a-zA-Z0-9 ]/g, "");
  const textArray = cleanText.toLowerCase().split(" ");
  return textArray;
};

const removeStopWords = (textArray) => {
  return textArray.filter((word) => !stopWords.includes(word));
};

const getSynonyms = (textArray) => {
  return textArray.map((word) => synonymMap[word] || word);
};

const getSingularForm = (textArray) => {
  return textArray.map((word) => pluralize.singular(word));
};

const deleteDuplicates = (textArray) => {
  return [...new Set(textArray)];
};

export { 
  modifiedTextArray,
  removeStopWords,
  getSynonyms,
  getSingularForm,
  deleteDuplicates
};