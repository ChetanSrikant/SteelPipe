export async function POST(request) {
    const { email, password } = await request.json();
  
    // Replace with your actual authentication logic
    const validUser = email === "user@example.com" && password === "password123";
  
    if (validUser) {
      return Response.json({ success: true });
    } else {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }
  }