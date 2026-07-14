import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const createEvent: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getEvents: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getEventById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=event.controller.d.ts.map