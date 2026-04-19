const fs = require('fs');

const songs = fs.readFileSync('songs.txt', 'utf-8').split('\n').filter(Boolean);
const exercises = fs.readFileSync('exercises.txt', 'utf-8').split('\n').filter(Boolean);

function cleanName(path) {
  let name = path.split('/').pop().replace(/\.(mid|midi)$/i, '');
  name = name.replace(/_/g, ' ');
  name = name.replace(/\[.*?\]/g, ''); // Remove brackets
  name = name.replace(/\s+/g, ' ').trim();
  // Title Case
  return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

const songIndex = songs.map(path => ({
  path: path.replace('public/', ''),
  name: cleanName(path)
}));

const exerciseIndex = exercises.map(path => {
  const parts = path.split('/');
  // public/piano-scales-exercises/Easy piano scales/Gammes de Do - C Scales/scale_c_major.mid
  const category = cleanName(parts[2]);
  const subCategory = cleanName(parts[3] || '');
  return {
    path: path.replace('public/', ''),
    name: cleanName(path),
    category,
    subCategory
  };
});

// Group exercises by Category -> SubCategory
const categorizedExercises = exerciseIndex.reduce((acc, item) => {
  if (!acc[item.category]) acc[item.category] = {};
  if (!acc[item.category][item.subCategory]) acc[item.category][item.subCategory] = [];
  acc[item.category][item.subCategory].push({ path: item.path, name: item.name });
  return acc;
}, {});

const output = `export interface MidiFile {
  path: string;
  name: string;
}

export interface ExerciseCategory {
  [key: string]: {
    [key: string]: MidiFile[];
  };
}

export const MIDI_SONGS: MidiFile[] = ${JSON.stringify(songIndex, null, 2)};

export const MIDI_EXERCISES: ExerciseCategory = ${JSON.stringify(categorizedExercises, null, 2)};
`;

fs.writeFileSync('src/app/midi-index.ts', output);
console.log('Generated src/app/midi-index.ts');
