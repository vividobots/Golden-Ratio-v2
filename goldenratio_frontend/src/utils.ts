// src/utils.ts
export interface DistanceItem {
  input: string | number
  reference: string | number
}

export function calculatePercentage({ input, reference }: DistanceItem): number {
  const inputNum = parseFloat(input as string)
  const refNum = parseFloat(reference as string)

  if (isNaN(inputNum) || isNaN(refNum) || refNum === 0) {
    return 0
  }

  return (inputNum / refNum) * 100;
}