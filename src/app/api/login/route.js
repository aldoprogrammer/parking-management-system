// src/app/api/login/route.js
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;

export async function POST(req) {
  const { username, password } = await req.json();
  
  try {
    // Fetch users from MockAPI
    const response = await fetch(
      `${baseUrl}/users`
    );
    const users = await response.json();

    // Check if there's a user with matching username and password
    const user = users.find(
      (user) => user.username === username && user.password === password
    );

    if (user) {
      // Generate a "dummy" token (replace with a real JWT if necessary)
      const token = `${user.id}-token`;

      // Send success response with user data and token
      return new Response(
        JSON.stringify({
          user: {
            id: user.id,
            username: user.username,
            role: user.role, // User role included
          },
          token, // Include the token in the response
        }),
        { status: 200 }
      );
    } else {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), {
        status: 401,
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
