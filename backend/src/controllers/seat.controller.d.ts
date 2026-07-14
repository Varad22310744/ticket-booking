import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getSeatsByEvent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const holdSeatController: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const releaseSeatController: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=seat.controller.d.ts.map