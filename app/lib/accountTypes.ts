export async function createAccount(name: string, amount: number) {
  const res = await fetch("/api/account-types", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, amount }),
  });

  if (!res.ok) throw new Error("Failed to create account");

  return res.json();
}

export async function updateAccount(id: number, name: string) {
  const res = await fetch(`/api/account-types/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Failed to update account");

  return res.json();
}
