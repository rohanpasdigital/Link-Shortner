import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Click, ClickDocument } from 'src/database/mongo/schema/click.schema';
import { Link, LinkDocument } from 'src/database/mongo/schema/link.schema';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import * as geoip from 'geoip-lite';


@Injectable()
export class LinksService {
  constructor(
    @InjectModel(Link.name) private linkModel: Model<LinkDocument>,
    @InjectModel(Click.name) private clickModel: Model<ClickDocument>,
  ) { }

  // create links
  async createShortLink(
    originalUrl: string,
    originalLinkId: string,
    moduleName: string,
  ) {
    try {
      if (!originalUrl) {
        throw new BadRequestException('Original URL is required');
      }

      if (!moduleName) {
        throw new BadRequestException('Module name is required');
      }

      // If originalLinkId exists, check if link already created
      if (originalLinkId) {
        const existingLink = await this.linkModel.findOne({ originalLinkId });

        if (existingLink) {
          return existingLink; // return existing short link
        }
      }

      const code = nanoid(7);
      const shortUrl = `${process.env.BASE_URL}/${code}`;

      const newLink = await this.linkModel.create({
        code,
        originalUrl,
        shortUrl,
        originalLinkId,
        moduleName,
        createdAt: new Date(),
      });

      if (!newLink) {
        throw new InternalServerErrorException('Failed to create short link');
      }

      return newLink;
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.message || 'Error creating short link',
      );
    }
  }

  //get a single link
  async findOne(code: string) {
    const link = await this.linkModel.findOne({ code }).lean();

    if (!link) {
      throw new Error('Link not found');
    }

    const clicks = await this.clickModel
      .find({ linkId: link._id })
      .sort({ createdAt: -1 })
      .lean();

    return {
      ...link,
      clicks,
    };
  }

  // get all links
  async findAll() {
    return this.linkModel
      .find()
      .sort({ createdAt: -1 })
      .lean();
  }

  // reduirect url
  async handleRedirect(code: string, req: any, res: any) {
    const link = await this.linkModel.findOne({ code });

    if (!link) {
      return res.status(404).render('index', {
        code,
      });
    }

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    // Get location
    const geo = geoip.lookup(ip);

    const country = geo?.country;

    await this.clickModel.create({
      linkId: link._id,
      ipAddress: ip,
      browser: userAgent,
      country
    });

    await this.linkModel.updateOne(
      { _id: link._id },
      { $inc: { totalClicks: 1 } },
    );

    return res.redirect(link.originalUrl);
  }

  //get the link analytics
  async getAnalytics(code: string) {
    const link = await this.linkModel.findOne({ code }).lean();

    if (!link) {
      throw new Error('Link not found');
    }

    const linkId = link._id;

    const [
      totalClicks,
      countryStats,
      browserStats,
      deviceStats,
      dailyClicks,
      recentClicks
    ] = await Promise.all([

      this.clickModel.countDocuments({ linkId }),

      this.clickModel.aggregate([
        { $match: { linkId } },
        { $group: { _id: '$country', clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } }
      ]),

      this.clickModel.aggregate([
        { $match: { linkId } },
        { $group: { _id: '$browser', clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } }
      ]),

      this.clickModel.aggregate([
        { $match: { linkId } },
        { $group: { _id: '$device', clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } }
      ]),

      this.clickModel.aggregate([
        { $match: { linkId } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            clicks: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      this.clickModel
        .find({ linkId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()

    ]);

    return {
      link: {
        code: link.code,
        shortUrl: link.shortUrl,
        originalUrl: link.originalUrl,
        createdAt: link.createdAt,
        totalClicks
      },

      analytics: {
        countries: countryStats,
        browsers: browserStats,
        devices: deviceStats,
        dailyTrend: dailyClicks,
        recentClicks
      }
    };
  }
}