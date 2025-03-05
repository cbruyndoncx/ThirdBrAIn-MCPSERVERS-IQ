import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors';
import { SearchParams, CodeAnalysisParams } from '../types';

export const validateSearch = (req: Request, res: Response, next: NextFunction) => {
    const params = req.body as SearchParams;
    if (!params.query) {
        throw new ValidationError('Search query is required');
    }
    if (params.query.length < 2) {
        throw new ValidationError('Search query must be at least 2 characters');
    }
    next();
};

export const validateAnalysis = (req: Request, res: Response, next: NextFunction) => {
    const params = req.body as CodeAnalysisParams;
    if (!params.code) {
        throw new ValidationError('Code is required');
    }
    if (!params.language) {
        throw new ValidationError('Programming language is required');
    }
    const supportedLanguages = ['javascript', 'typescript', 'python', 'java'];
    if (!supportedLanguages.includes(params.language.toLowerCase())) {
        throw new ValidationError(
            `Language ${params.language} is not supported. ` +
            `Supported languages: ${supportedLanguages.join(', ')}`
        );
    }
    next();
};