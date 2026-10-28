import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('jobs/:jobId/ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  create(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Req() req,
    @Body() dto: CreateRatingDto,
  ) {
    const authorId = req.user.sub ?? req.user.id ?? req.user.userId;
    return this.ratingsService.create(jobId, authorId, dto);
  }

  @Get()
  findByJob(@Param('jobId', ParseUUIDPipe) jobId: string) {
    return this.ratingsService.findByJob(jobId);
  }
}