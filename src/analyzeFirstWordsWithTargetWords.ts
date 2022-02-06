import {AVAILABLE_WORDS} from "./globals";
import {WordSuggesterAnalyzer} from "./wordSuggesterAnalyzer";

const analyzer = new WordSuggesterAnalyzer(AVAILABLE_WORDS, './dist_analyze/firstWordAnalysisWithTargetWords.json');

analyzer.analyze();
