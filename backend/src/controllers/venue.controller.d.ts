import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const createVenue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getVenues: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getVenueById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=venue.controller.d.ts.map