import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const confirmBooking: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyBookings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const cancelBooking: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=booking.controller.d.ts.map