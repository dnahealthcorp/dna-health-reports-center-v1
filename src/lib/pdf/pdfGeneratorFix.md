
# Type Fix for pdfGenerator.ts

Find the line near line 287 that has this error:
`Type 'string' is not assignable to type 'string[]'`

Look for a section where a string is being assigned to a variable that expects a string array. 

Replace it with one of these patterns:

1. If assigning a string to string[]:
```typescript
// From:
someStringArrayVar = someStringValue;

// To:
someStringArrayVar = [someStringValue];
```

2. If the variable is expecting a string[] but might receive a string:
```typescript
// From:
someStringArrayVar = somePossiblyStringValue;

// To:
someStringArrayVar = typeof somePossiblyStringValue === 'string' 
  ? [somePossiblyStringValue] 
  : somePossiblyStringValue;
```

3. Alternatively, you can use the helper functions we added:
```typescript
someStringArrayVar = ensureStringArray(somePossiblyStringValue);
```

Apply the appropriate fix on line 287 (or nearby) of src/lib/pdf/pdfGenerator.ts.
