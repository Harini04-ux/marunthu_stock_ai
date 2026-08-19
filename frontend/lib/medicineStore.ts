export type Medicine = {
  id: number;
  name: string;
  code: string;
  batch: string;
  category: string;
  quantity: number;
  minimum: number;
  expiry: string;
};

const STORAGE_KEY = "medicine-stock-data";

export const defaultMedicines: Medicine[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    code: "PCM001",
    batch: "PCM2026A",
    category: "Tablet",
    quantity: 100,
    minimum: 20,
    expiry: "2027-06-30",
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    code: "AMX002",
    batch: "AMX2026B",
    category: "Capsule",
    quantity: 15,
    minimum: 20,
    expiry: "2027-02-15",
  },
  {
    id: 3,
    name: "ORS Sachets",
    code: "ORS003",
    batch: "ORS2026C",
    category: "Sachet",
    quantity: 8,
    minimum: 20,
    expiry: "2026-09-10",
  },
  {
    id: 4,
    name: "Cetirizine 10mg",
    code: "CTZ004",
    batch: "CTZ2026D",
    category: "Tablet",
    quantity: 0,
    minimum: 20,
    expiry: "2027-04-20",
  },
  {
    id: 5,
    name: "Omeprazole 20mg",
    code: "OMP005",
    batch: "OMP2026E",
    category: "Capsule",
    quantity: 75,
    minimum: 20,
    expiry: "2028-01-10",
  },
];

export function getMedicines(): Medicine[] {
  if (typeof window === "undefined") {
    return defaultMedicines;
  }

  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultMedicines)
    );

    return defaultMedicines;
  }

  try {
    return JSON.parse(savedData);
  } catch {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultMedicines)
    );

    return defaultMedicines;
  }
}

export function saveMedicines(
  medicines: Medicine[]
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(medicines)
  );
}

export function updateMedicineStock(
  id: number,
  change: number
): Medicine[] {
  const medicines = getMedicines();

  const updatedMedicines = medicines.map(
    (medicine) =>
      medicine.id === id
        ? {
            ...medicine,
            quantity: Math.max(
              0,
              medicine.quantity + change
            ),
          }
        : medicine
  );

  saveMedicines(updatedMedicines);

  return updatedMedicines;
}