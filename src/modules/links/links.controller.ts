import { Body, Controller, ForbiddenException, Get, Param, Post, Req, Res } from '@nestjs/common';
import { LinksService } from './links.service';
import { type Request, type Response } from 'express';
import { CreateLinksDto } from './dto/create-links-dto';

@Controller()
export class LinksController {

    constructor(private readonly linkService: LinksService) { }

    // create links
    @Post('/link/shorten')
    async createShortLink(
        @Body() dto: CreateLinksDto,
        @Req() req: Request
    ) {

        const apiKey = req.headers['x-api-key'];

        if (!apiKey || apiKey !== process.env.LINK_GENERATOR_KEY) {
            throw new ForbiddenException('Invalid API key');
        }

        return this.linkService.createShortLink(dto.url, dto.originalLinkId, dto?.moduleName);
    }

    // get all links
    @Get('/link')
    async findAll() {
        return this.linkService.findAll();
    }

    //get a single link
    @Get('/link/:code')
    async findOne(@Param('code') code: string) {
        return this.linkService.findOne(code);
    }

    //get the link analytics
    @Get('/link/:code/analytics')
    async getAnalytics(@Param('code') code: string) {
        return this.linkService.getAnalytics(code);
    }

    // reduirect url
    @Get('/:code')
    async redirect(
        @Param('code') code: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        return this.linkService.handleRedirect(code, req, res);
    }
}