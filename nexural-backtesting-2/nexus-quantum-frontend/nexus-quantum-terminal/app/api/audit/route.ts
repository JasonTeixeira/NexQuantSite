import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface AuditEvent {
  timestamp: string;
  event: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class AuditLogger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = join(process.cwd(), 'logs');
    this.logFile = join(this.logDir, 'audit.log');
    
    // Ensure log directory exists
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(event: AuditEvent) {
    const logEntry = JSON.stringify({
      ...event,
      timestamp: new Date().toISOString(),
    }) + '\n';

    try {
      appendFileSync(this.logFile, logEntry);
      
      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AUDIT] ${event.event}:`, event);
      }
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  getLogs(limit: number = 100): AuditEvent[] {
    try {
      if (!existsSync(this.logFile)) {
        return [];
      }

      const fs = require('fs');
      const content = fs.readFileSync(this.logFile, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);
      
      return lines
        .slice(-limit)
        .map(line => JSON.parse(line))
        .reverse();
    } catch (error) {
      console.error('Failed to read audit logs:', error);
      return [];
    }
  }
}

const auditLogger = new AuditLogger();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, userId, sessionId, details, severity = 'low' } = body;

    // Extract request information
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const url = request.url;
    const method = request.method;

    const auditEvent: AuditEvent = {
      timestamp: new Date().toISOString(),
      event,
      userId,
      sessionId,
      ip,
      userAgent,
      url,
      method,
      details,
      severity,
    };

    // Log the event
    auditLogger.log(auditEvent);

    // Send to Sentry for critical events
    if (severity === 'critical' && process.env.NODE_ENV === 'production') {
      const Sentry = require('@sentry/nextjs');
      Sentry.captureMessage(`Critical audit event: ${event}`, {
        level: 'error',
        tags: {
          audit_event: event,
          severity,
          userId,
        },
        extra: auditEvent,
      });
    }

    return NextResponse.json({ success: true, logged: true });
  } catch (error) {
    console.error('Audit logging error:', error);
    return NextResponse.json(
      { error: 'Failed to log audit event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const event = searchParams.get('event');
    const severity = searchParams.get('severity');

    let logs = auditLogger.getLogs(limit);

    // Filter by event type if specified
    if (event) {
      logs = logs.filter(log => log.event === event);
    }

    // Filter by severity if specified
    if (severity) {
      logs = logs.filter(log => log.severity === severity);
    }

    return NextResponse.json({ logs, count: logs.length });
  } catch (error) {
    console.error('Failed to retrieve audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve audit logs' },
      { status: 500 }
    );
  }
}


