import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health(): { data: { ok: true; service: 'pair-api' } } {
    return {
      data: {
        ok: true,
        service: 'pair-api',
      },
    };
  }
}
