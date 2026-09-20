const testStrings = [
  'true{"row_id": 1}',
  'true {"row_id": 1}',
  'true\n{"row_id": 1}',
  'null{"row_id": 1}',
  'null {"row_id": 1}',
  '1234{"row_id": 1}',
  '1234 {"row_id": 1}',
  '{"a":1}{"b":2}'
];

for (const s of testStrings) {
  try {
    JSON.parse(s);
  } catch (err) {
    console.log(JSON.stringify(s), '->', err.message);
  }
}
