import toast from "react-hot-toast";

// A browser holds one account at a time: a student or an organiser. Starting a
// login (or sign-up) for one while the other is signed in is refused until
// they log out — nothing is switched silently.
export const blockedByOtherSession = (wanted) => {
  const student = !!localStorage.getItem("token");
  const admin = !!localStorage.getItem("adminToken");

  if (wanted === "student" && admin) {
    toast.error("You're signed in as an organiser. Log out first (profile icon → Logout) to use a student account.", { id: "other-session", duration: 6000 });
    return true;
  }
  if (wanted === "admin" && student) {
    toast.error("You're signed in as a student. Log out first (profile icon → Logout) to use an organiser account.", { id: "other-session", duration: 6000 });
    return true;
  }
  return false;
};
