// import { toast } from "sonner";
// import { fetcher } from "./httpReq";

// let attempts = 0;
// let isFetching = false;

// export default async function handleUserSession() {
//   if (isFetching) {
//     return;
//   }
//   isFetching = true;
//   if (attempts >= 3) {
//     //If the attempts reach 3, we can log an error and return
//     toast.error("Failed to fetch user session after 3 attempts");
//     isFetching = false;
//     return;
//   }
//   const result = await fetcher("/user/amIWorthy", "GET");
//   if (result.status === 401) {
//     // call the login function
//     attempts++;
//     await fetcher("/auth/login", "GET");
//     isFetching = false;

//     // retry fetching the user session
//     handleUserSession();
//   } else if (result.ok) {
//     attempts = 0; // reset attempts on success
//     return;
//   }
//   attempts++;
// }
