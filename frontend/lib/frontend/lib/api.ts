const BASE_URL = "http://127.0.0.1:8000";

export async function getMedicines() {
  const response = await fetch(`${BASE_URL}/medicines`);

  if (!response.ok) {
    throw new Error("Failed to fetch medicines");
  }

  return response.json();
}

export async function addMedicine(medicine: {
  medicine_name: string;
  quantity: number;
  reorder_level: number;
  expiry_date: string;
  batch_number: string;
}) {
  const response = await fetch(`${BASE_URL}/medicines`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(medicine),
  });

  if (!response.ok) {
    throw new Error("Failed to add medicine");
  }

  return response.json();
}

export async function updateMedicine(
  id: number,
  medicine: {
    medicine_name: string;
    quantity: number;
    reorder_level: number;
    expiry_date: string;
    batch_number: string;
  }
) {
  const response = await fetch(`${BASE_URL}/medicines/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(medicine),
  });

  if (!response.ok) {
    throw new Error("Failed to update medicine");
  }

  return response.json();
}

export async function deleteMedicine(id: number) {
  const response = await fetch(`${BASE_URL}/medicines/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete medicine");
  }

  return response.json();
}