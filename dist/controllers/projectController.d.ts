import { Response } from 'express';
import { AuthRequest } from '../src/middleware/auth';
export declare const saveProject: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProject: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listProjects: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteProject: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateProjectTitle: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=projectController.d.ts.map