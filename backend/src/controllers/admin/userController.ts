// import { Request, Response, NextFunction } from "express";
// import * as service from "../../services/adminUserService";

// interface CustomRequest extends Request {
//   userId?: number;
//   user?: any;
// }

// export const getUsers = async (_req: Request, res: Response) => {
//   const users = await service.getAdminUsers();
//   res.json({ users });
// };

// export const getUserDetail = async (req: Request, res: Response) => {
//   const userId = Number(req.params.id);
//   const user = await service.getAdminUserById(userId);

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   res.json({ user });
// };

// export const updateUser = async (req: Request, res: Response) => {
//   const { id, role, status } = req.body;

//   await service.updateAdminUser({
//     id: Number(id),
//     role,
//     status,
//   });

//   res.json({ success: true });
// };
