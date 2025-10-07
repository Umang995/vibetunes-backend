const mapMood = (label) => {
  const moodMap = {
    // Primary emotions
    happy: "Happy",
    joy: "Happy",
    pleasure: "Happy",

    // Calm/Neutral emotions
    neutral: "Calm",
    calm: "Calm",
    peaceful: "Calm",

    // Sad emotions
    sad: "Melancholic",
    sadness: "Melancholic",
    sorrow: "Melancholic",
    grief: "Melancholic",

    // Angry/Energetic emotions
    angry: "Energetic",
    anger: "Energetic",
    rage: "Energetic",
    mad: "Energetic",

    // Surprised/Excited emotions
    surprised: "Excited",
    surprise: "Excited",
    amazement: "Excited",
    wonder: "Excited",

    // Fear emotions (map to Melancholic as they're negative)
    fear: "Melancholic",
    scared: "Melancholic",
    afraid: "Melancholic",

    // Disgust emotions (map to Melancholic)
    disgust: "Melancholic",
    disgusted: "Melancholic",

    // Love/Romance emotions
    love: "Romantic",
    affection: "Romantic",
    romantic: "Romantic"
  };

  // Convert label to lowercase for matching
  const normalizedLabel = label.toLowerCase();
  return moodMap[normalizedLabel] || "Calm";
};

// Function to validate emotion consistency across multiple AI models
const validateEmotionConsistency = (bestResult, allResults) => {
  // If we only have one result, return it as-is
  if (allResults.length <= 1) {
    return bestResult;
  }

  console.log('🔍 Validating emotion consistency across models...');

  // Count emotion types across all models
  const emotionCounts = {};
  const moodCounts = {};

  allResults.forEach(result => {
    const emotion = result.emotion.toLowerCase();
    const mood = mapMood(emotion);

    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  console.log('📊 Emotion distribution:', emotionCounts);
  console.log('📊 Mood distribution:', moodCounts);

  // Find the most common mood across models
  const mostCommonMood = Object.keys(moodCounts).reduce((a, b) =>
    moodCounts[a] > moodCounts[b] ? a : b
  );

  // If there's consensus (2+ models agree on mood), use the highest confidence from that mood
  const consensusThreshold = Math.max(1, Math.floor(allResults.length / 2));

  if (moodCounts[mostCommonMood] >= consensusThreshold) {
    console.log(`✅ Found consensus for mood: ${mostCommonMood}`);

    // Find the highest confidence result that maps to the consensus mood
    const consensusResults = allResults.filter(result =>
      mapMood(result.emotion) === mostCommonMood
    );

    const bestConsensusResult = consensusResults.reduce((prev, current) =>
      (prev.confidence > current.confidence) ? prev : current
    );

    return {
      emotion: bestConsensusResult.emotion,
      confidence: Math.min(bestConsensusResult.confidence * 1.1, 0.95), // Boost confidence slightly for consensus
      allEmotions: bestConsensusResult.allEmotions
    };
  }

  // No clear consensus, apply confidence penalty and return original best result
  console.log('⚠️ No consensus found, using best single result with confidence penalty');

  return {
    emotion: bestResult.emotion,
    confidence: bestResult.confidence * 0.85, // Reduce confidence when no consensus
    allEmotions: bestResult.allEmotions
  };
};

module.exports = { mapMood, validateEmotionConsistency };
