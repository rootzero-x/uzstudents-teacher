import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { teacherApi } from "../services/api/teacherApi";

const Ctx = createContext(null);

export function TeacherAuthProvider({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [booting, setBooting] = useState(true);

  const refresh = async () => {
    try {
      const res = await teacherApi.me();
      setTeacher(res.teacher);
    } catch {
      setTeacher(null);
    } finally {
      setBooting(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({
      teacher,
      booting,
      refresh,
      login: async (login, password) => {
        const res = await teacherApi.login({ login, password });
        setTeacher(res.teacher);
        return res;
      },
      logout: async () => {
        await teacherApi.logout();
        setTeacher(null);
      },
    }),
    [teacher, booting]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTeacherAuth = () => useContext(Ctx);
