/**
 * Security & Compliance Components
 * 11. Threat Intelligence Feed
 * 12. Penetration Test Results
 * 13. Compliance Checklist
 * 14. Data Classification Map
 * 15. Access Review Workflows
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Scan,
  Target,
  Bug,
  Skull,
  Globe,
  Server,
  Database,
  Cloud,
  File,
  FileText,
  Folder,
  FolderLock,
  Users,
  UserCheck,
  UserX,
  UserCog,
  Clock,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Download,
  Flag,
  Bookmark,
  MoreHorizontal,
  ArrowRight,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  MapPin,
  Network,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
} from '../../design-system';

// ============================================================================
// 11. THREAT INTELLIGENCE FEED
// ============================================================================

interface ThreatIntel {
  id: string;
  type: 'malware' | 'phishing' | 'ddos' | 'vulnerability' | 'apt' | 'ransomware';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  publishedAt: Date;
  indicators: string[];
  affectedSystems: string[];
  mitigations: string[];
  isRelevant: boolean;
}

const mockThreats: ThreatIntel[] = [
  {
    id: '1',
    type: 'vulnerability',
    title: 'Critical Zero-Day in Node.js Runtime',
    description: 'Remote code execution vulnerability affecting Node.js versions 18.x and 20.x',
    severity: 'critical',
    source: 'NVD/CVE-2025-1234',
    publishedAt: new Date(Date.now() - 3600000),
    indicators: ['CVE-2025-1234', 'node.js', 'RCE'],
    affectedSystems: ['API Server 1', 'API Server 2'],
    mitigations: ['Update to Node.js 20.11.1+', 'Apply WAF rules'],
    isRelevant: true,
  },
  {
    id: '2',
    type: 'phishing',
    title: 'Targeted Phishing Campaign Detected',
    description: 'Sophisticated phishing emails targeting enterprise admin credentials',
    severity: 'high',
    source: 'Internal SOC',
    publishedAt: new Date(Date.now() - 7200000),
    indicators: ['admin-portal-secure.com', 'suspicious@domain.ru'],
    affectedSystems: [],
    mitigations: ['Block domains', 'User awareness training'],
    isRelevant: false,
  },
  {
    id: '3',
    type: 'ddos',
    title: 'DDoS Attack Pattern Identified',
    description: 'New amplification technique using DNS servers',
    severity: 'medium',
    source: 'Cloudflare Radar',
    publishedAt: new Date(Date.now() - 86400000),
    indicators: ['UDP/53', 'ANY queries', 'amplification'],
    affectedSystems: [],
    mitigations: ['Enable rate limiting', 'Configure DDoS protection'],
    isRelevant: true,
  },
];

export function ThreatIntelligenceFeed() {
  const [threats, setThreats] = useState<ThreatIntel[]>(mockThreats);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const getTypeIcon = (type: ThreatIntel['type']) => {
    const icons = {
      malware: <Bug className="w-4 h-4" />,
      phishing: <Target className="w-4 h-4" />,
      ddos: <Zap className="w-4 h-4" />,
      vulnerability: <ShieldAlert className="w-4 h-4" />,
      apt: <Skull className="w-4 h-4" />,
      ransomware: <Lock className="w-4 h-4" />,
    };
    return icons[type];
  };

  const getSeverityColor = (severity: ThreatIntel['severity']) => {
    const colors = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-blue-500 text-white',
    };
    return colors[severity];
  };

  const filteredThreats = filterSeverity === 'all'
    ? threats
    : threats.filter(t => t.severity === filterSeverity);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Threat Intelligence</h3>
            <Badge variant="danger" size="sm">{threats.filter(t => t.isRelevant && t.severity === 'critical').length} Critical</Badge>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 bg-white dark:bg-neutral-800"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-3 max-h-[500px] overflow-y-auto">
        {filteredThreats.map((threat) => (
          <motion.div
            key={threat.id}
            className={`border rounded-xl overflow-hidden ${threat.isRelevant ? 'border-red-200 dark:border-red-900' : 'border-neutral-200 dark:border-neutral-700'}`}
          >
            <div
              className={`p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${threat.isRelevant ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
              onClick={() => setExpandedId(expandedId === threat.id ? null : threat.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getSeverityColor(threat.severity)}`}>
                  {getTypeIcon(threat.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-neutral-900 dark:text-white">{threat.title}</span>
                    {threat.isRelevant && <Badge variant="danger" size="xs">Affects You</Badge>}
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{threat.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                    <span>{threat.source}</span>
                    <span>•</span>
                    <span>{Math.round((Date.now() - threat.publishedAt.getTime()) / 3600000)}h ago</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === threat.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            <AnimatePresence>
              {expandedId === threat.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
                >
                  <div className="p-4 space-y-4">
                    {threat.affectedSystems.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Affected Systems</p>
                        <div className="flex flex-wrap gap-2">
                          {threat.affectedSystems.map((system) => (
                            <Badge key={system} variant="danger" size="sm">{system}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Indicators</p>
                      <div className="flex flex-wrap gap-2">
                        {threat.indicators.map((indicator) => (
                          <code key={indicator} className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">{indicator}</code>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Recommended Mitigations</p>
                      <ul className="space-y-1">
                        {threat.mitigations.map((mitigation, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {mitigation}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button variant="primary" size="sm">Create Ticket</Button>
                      <Button variant="outline" size="sm" leftIcon={<ExternalLink className="w-4 h-4" />}>View Details</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </CardBody>
    </Card>
  );
}

// ============================================================================
// 12. PENETRATION TEST RESULTS
// ============================================================================

interface PentestFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  status: 'open' | 'in_progress' | 'remediated' | 'accepted';
  cvss: number;
  description: string;
  recommendation: string;
  affectedUrl?: string;
}

interface PentestReport {
  id: string;
  name: string;
  type: 'external' | 'internal' | 'web_app' | 'api' | 'mobile';
  vendor: string;
  startDate: Date;
  endDate: Date;
  status: 'in_progress' | 'completed' | 'scheduled';
  findings: PentestFinding[];
  overallRisk: 'critical' | 'high' | 'medium' | 'low';
}

const mockPentestReport: PentestReport = {
  id: '1',
  name: 'Q1 2025 External Penetration Test',
  type: 'external',
  vendor: 'SecureTest Inc.',
  startDate: new Date(Date.now() - 604800000),
  endDate: new Date(Date.now() - 86400000),
  status: 'completed',
  overallRisk: 'medium',
  findings: [
    { id: '1', title: 'SQL Injection in Search API', severity: 'critical', category: 'Injection', status: 'in_progress', cvss: 9.8, description: 'SQLi vulnerability in /api/search endpoint', recommendation: 'Use parameterized queries', affectedUrl: '/api/search' },
    { id: '2', title: 'Missing Rate Limiting', severity: 'high', category: 'API Security', status: 'open', cvss: 7.5, description: 'No rate limiting on authentication endpoints', recommendation: 'Implement rate limiting', affectedUrl: '/api/auth/*' },
    { id: '3', title: 'Outdated TLS Configuration', severity: 'medium', category: 'Cryptography', status: 'remediated', cvss: 5.3, description: 'TLS 1.0/1.1 still enabled', recommendation: 'Disable TLS 1.0/1.1' },
    { id: '4', title: 'Missing Security Headers', severity: 'low', category: 'Configuration', status: 'open', cvss: 3.1, description: 'X-Content-Type-Options header missing', recommendation: 'Add security headers' },
    { id: '5', title: 'Server Version Disclosure', severity: 'info', category: 'Information Disclosure', status: 'accepted', cvss: 0, description: 'Server banner reveals version', recommendation: 'Hide server version' },
  ],
};

export function PenetrationTestResults() {
  const [report] = useState<PentestReport>(mockPentestReport);
  const [selectedFinding, setSelectedFinding] = useState<PentestFinding | null>(null);

  const severityCounts = {
    critical: report.findings.filter(f => f.severity === 'critical').length,
    high: report.findings.filter(f => f.severity === 'high').length,
    medium: report.findings.filter(f => f.severity === 'medium').length,
    low: report.findings.filter(f => f.severity === 'low').length,
    info: report.findings.filter(f => f.severity === 'info').length,
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
      info: 'bg-neutral-500',
    };
    return colors[severity];
  };

  const getStatusBadge = (status: PentestFinding['status']) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
      remediated: 'success',
      in_progress: 'warning',
      open: 'danger',
      accepted: 'secondary',
    };
    return <Badge variant={variants[status]} size="xs">{status.replace('_', ' ')}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Penetration Test Results</h3>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {/* Report Summary */}
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white">{report.name}</h4>
              <p className="text-sm text-neutral-500">by {report.vendor}</p>
            </div>
            <Badge variant={report.overallRisk === 'critical' || report.overallRisk === 'high' ? 'danger' : 'warning'} size="sm">
              {report.overallRisk.toUpperCase()} RISK
            </Badge>
          </div>

          {/* Severity Distribution */}
          <div className="flex items-center gap-2 mb-4">
            {Object.entries(severityCounts).map(([severity, count]) => (
              <div key={severity} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full ${getSeverityColor(severity)} flex items-center justify-center text-white text-xs font-bold`}>
                  {count}
                </div>
                <span className="text-xs text-neutral-500 capitalize">{severity}</span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Remediation Progress</span>
            <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${(report.findings.filter(f => f.status === 'remediated').length / report.findings.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {report.findings.filter(f => f.status === 'remediated').length}/{report.findings.length}
            </span>
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-2">
          {report.findings.map((finding) => (
            <motion.div
              key={finding.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedFinding?.id === finding.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
              }`}
              onClick={() => setSelectedFinding(selectedFinding?.id === finding.id ? null : finding)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${getSeverityColor(finding.severity)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900 dark:text-white text-sm">{finding.title}</span>
                    {getStatusBadge(finding.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                    <span>{finding.category}</span>
                    <span>CVSS: {finding.cvss}</span>
                    {finding.affectedUrl && <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">{finding.affectedUrl}</code>}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedFinding?.id === finding.id ? 'rotate-90' : ''}`} />
              </div>

              <AnimatePresence>
                {selectedFinding?.id === finding.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700"
                  >
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{finding.description}</p>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">Recommendation:</p>
                      <p className="text-sm text-green-600 dark:text-green-400">{finding.recommendation}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// 13. COMPLIANCE CHECKLIST
// ============================================================================

interface ComplianceItem {
  id: string;
  control: string;
  description: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
  evidence?: string;
  lastReviewed?: Date;
  assignee?: string;
  dueDate?: Date;
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  overallScore: number;
  items: ComplianceItem[];
  lastAudit?: Date;
  nextAudit?: Date;
}

const mockFrameworks: ComplianceFramework[] = [
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    description: 'Service Organization Control 2',
    version: '2017',
    overallScore: 94,
    lastAudit: new Date(Date.now() - 2592000000),
    nextAudit: new Date(Date.now() + 7776000000),
    items: [
      { id: '1', control: 'CC1.1', description: 'Integrity and Ethical Values', status: 'compliant', lastReviewed: new Date() },
      { id: '2', control: 'CC2.1', description: 'Security Policy Communication', status: 'compliant', lastReviewed: new Date() },
      { id: '3', control: 'CC3.1', description: 'Risk Assessment Process', status: 'partial', assignee: 'security@company.com', dueDate: new Date(Date.now() + 604800000) },
      { id: '4', control: 'CC4.1', description: 'Monitoring Activities', status: 'compliant', lastReviewed: new Date() },
      { id: '5', control: 'CC5.1', description: 'Logical Access Controls', status: 'non_compliant', assignee: 'it@company.com', dueDate: new Date(Date.now() + 1209600000) },
    ],
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    version: '2018',
    overallScore: 87,
    items: [
      { id: '1', control: 'Art. 5', description: 'Principles of Processing', status: 'compliant' },
      { id: '2', control: 'Art. 6', description: 'Lawful Basis', status: 'compliant' },
      { id: '3', control: 'Art. 17', description: 'Right to Erasure', status: 'partial' },
      { id: '4', control: 'Art. 32', description: 'Security of Processing', status: 'compliant' },
    ],
  },
];

export function ComplianceChecklist() {
  const [frameworks] = useState<ComplianceFramework[]>(mockFrameworks);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework>(mockFrameworks[0]);

  const getStatusIcon = (status: ComplianceItem['status']) => {
    const icons = {
      compliant: <CheckCircle className="w-4 h-4 text-green-500" />,
      partial: <AlertCircle className="w-4 h-4 text-yellow-500" />,
      non_compliant: <XCircle className="w-4 h-4 text-red-500" />,
      not_applicable: <Eye className="w-4 h-4 text-neutral-400" />,
    };
    return icons[status];
  };

  const statusCounts = {
    compliant: selectedFramework.items.filter(i => i.status === 'compliant').length,
    partial: selectedFramework.items.filter(i => i.status === 'partial').length,
    non_compliant: selectedFramework.items.filter(i => i.status === 'non_compliant').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Compliance Checklist</h3>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedFramework.id}
              onChange={(e) => setSelectedFramework(frameworks.find(f => f.id === e.target.value) || frameworks[0])}
              className="text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 bg-white dark:bg-neutral-800"
            >
              {frameworks.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {/* Framework Summary */}
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white">{selectedFramework.name}</h4>
              <p className="text-sm text-neutral-500">{selectedFramework.description}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-600">{selectedFramework.overallScore}%</p>
              <p className="text-sm text-neutral-500">Compliance Score</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{statusCounts.compliant} Compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{statusCounts.partial} Partial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{statusCounts.non_compliant} Non-Compliant</span>
            </div>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-2">
          {selectedFramework.items.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border ${
                item.status === 'non_compliant' ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10' :
                item.status === 'partial' ? 'border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/10' :
                'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(item.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded">{item.control}</code>
                    <span className="font-medium text-neutral-900 dark:text-white text-sm">{item.description}</span>
                  </div>
                  {(item.assignee || item.dueDate) && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                      {item.assignee && <span>Assigned: {item.assignee}</span>}
                      {item.dueDate && <span>Due: {item.dueDate.toLocaleDateString()}</span>}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// 14. DATA CLASSIFICATION MAP
// ============================================================================

interface DataAsset {
  id: string;
  name: string;
  type: 'database' | 'file_storage' | 'api' | 'log' | 'backup';
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  location: string;
  owner: string;
  dataTypes: string[];
  encryptionStatus: 'encrypted' | 'partial' | 'unencrypted';
  accessCount: number;
  lastAccessed: Date;
}

const mockDataAssets: DataAsset[] = [
  { id: '1', name: 'User Database', type: 'database', classification: 'restricted', location: 'AWS RDS (us-east-1)', owner: 'data-team@company.com', dataTypes: ['PII', 'Authentication', 'Financial'], encryptionStatus: 'encrypted', accessCount: 1250, lastAccessed: new Date() },
  { id: '2', name: 'Analytics Logs', type: 'log', classification: 'internal', location: 'Elasticsearch', owner: 'analytics@company.com', dataTypes: ['Usage Data', 'Events'], encryptionStatus: 'encrypted', accessCount: 8500, lastAccessed: new Date() },
  { id: '3', name: 'Public API', type: 'api', classification: 'public', location: 'CloudFlare CDN', owner: 'api-team@company.com', dataTypes: ['Public Content'], encryptionStatus: 'encrypted', accessCount: 450000, lastAccessed: new Date() },
  { id: '4', name: 'HR Documents', type: 'file_storage', classification: 'confidential', location: 'AWS S3 (encrypted)', owner: 'hr@company.com', dataTypes: ['Employee Records', 'Contracts'], encryptionStatus: 'encrypted', accessCount: 45, lastAccessed: new Date(Date.now() - 86400000) },
  { id: '5', name: 'Daily Backups', type: 'backup', classification: 'restricted', location: 'AWS S3 Glacier', owner: 'ops@company.com', dataTypes: ['Full Database Dumps'], encryptionStatus: 'encrypted', accessCount: 2, lastAccessed: new Date(Date.now() - 604800000) },
];

export function DataClassificationMap() {
  const [assets] = useState<DataAsset[]>(mockDataAssets);
  const [selectedClassification, setSelectedClassification] = useState<string>('all');

  const getClassificationColor = (classification: DataAsset['classification']) => {
    const colors = {
      public: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300',
      internal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300',
      confidential: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300',
      restricted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300',
    };
    return colors[classification];
  };

  const getTypeIcon = (type: DataAsset['type']) => {
    const icons = {
      database: <Database className="w-4 h-4" />,
      file_storage: <Folder className="w-4 h-4" />,
      api: <Globe className="w-4 h-4" />,
      log: <FileText className="w-4 h-4" />,
      backup: <Cloud className="w-4 h-4" />,
    };
    return icons[type];
  };

  const filteredAssets = selectedClassification === 'all'
    ? assets
    : assets.filter(a => a.classification === selectedClassification);

  const classificationCounts = {
    public: assets.filter(a => a.classification === 'public').length,
    internal: assets.filter(a => a.classification === 'internal').length,
    confidential: assets.filter(a => a.classification === 'confidential').length,
    restricted: assets.filter(a => a.classification === 'restricted').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Data Classification Map</h3>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export Inventory
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {/* Classification Summary */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {Object.entries(classificationCounts).map(([classification, count]) => (
            <button
              key={classification}
              onClick={() => setSelectedClassification(selectedClassification === classification ? 'all' : classification)}
              className={`p-3 rounded-xl border transition-all ${
                selectedClassification === classification
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg ${getClassificationColor(classification as DataAsset['classification'])} flex items-center justify-center mb-2`}>
                {classification === 'restricted' ? <Lock className="w-4 h-4" /> :
                 classification === 'confidential' ? <EyeOff className="w-4 h-4" /> :
                 classification === 'internal' ? <Users className="w-4 h-4" /> :
                 <Globe className="w-4 h-4" />}
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{count}</p>
              <p className="text-xs text-neutral-500 capitalize">{classification}</p>
            </button>
          ))}
        </div>

        {/* Data Assets List */}
        <div className="space-y-3">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className={`p-4 rounded-xl border ${getClassificationColor(asset.classification)}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-neutral-800">
                  {getTypeIcon(asset.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-neutral-900 dark:text-white">{asset.name}</span>
                    <Badge variant={asset.encryptionStatus === 'encrypted' ? 'success' : 'warning'} size="xs">
                      {asset.encryptionStatus === 'encrypted' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {asset.encryptionStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{asset.location}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {asset.dataTypes.map((type) => (
                      <Badge key={type} variant="secondary" size="xs">{type}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span>Owner: {asset.owner}</span>
                    <span>Access: {asset.accessCount.toLocaleString()}/day</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// 15. ACCESS REVIEW WORKFLOWS
// ============================================================================

interface AccessReviewItem {
  id: string;
  user: string;
  email: string;
  role: string;
  department: string;
  resources: string[];
  lastActive: Date;
  riskScore: number;
  recommendation: 'approve' | 'revoke' | 'modify';
  status: 'pending' | 'approved' | 'revoked' | 'modified';
  reviewedBy?: string;
  reviewedAt?: Date;
}

interface AccessReview {
  id: string;
  name: string;
  type: 'quarterly' | 'annual' | 'termination' | 'role_change';
  status: 'in_progress' | 'completed' | 'scheduled';
  startDate: Date;
  dueDate: Date;
  progress: number;
  items: AccessReviewItem[];
  reviewer: string;
}

const mockAccessReview: AccessReview = {
  id: '1',
  name: 'Q1 2025 Access Review',
  type: 'quarterly',
  status: 'in_progress',
  startDate: new Date(Date.now() - 604800000),
  dueDate: new Date(Date.now() + 604800000),
  progress: 65,
  reviewer: 'security@company.com',
  items: [
    { id: '1', user: 'John Doe', email: 'john.doe@company.com', role: 'Admin', department: 'Engineering', resources: ['All Apps', 'Database', 'Logs'], lastActive: new Date(), riskScore: 75, recommendation: 'modify', status: 'pending' },
    { id: '2', user: 'Jane Smith', email: 'jane.smith@company.com', role: 'Developer', department: 'Engineering', resources: ['Dev Apps', 'Staging DB'], lastActive: new Date(), riskScore: 25, recommendation: 'approve', status: 'approved', reviewedBy: 'manager@company.com', reviewedAt: new Date(Date.now() - 86400000) },
    { id: '3', user: 'Former Employee', email: 'former@company.com', role: 'Viewer', department: 'Marketing', resources: ['Analytics', 'Reports'], lastActive: new Date(Date.now() - 7776000000), riskScore: 95, recommendation: 'revoke', status: 'pending' },
    { id: '4', user: 'Contractor', email: 'contractor@external.com', role: 'External', department: 'Consulting', resources: ['Specific Project'], lastActive: new Date(Date.now() - 604800000), riskScore: 60, recommendation: 'modify', status: 'pending' },
  ],
};

export function AccessReviewWorkflows() {
  const [review, setReview] = useState<AccessReview>(mockAccessReview);

  const handleAction = (itemId: string, action: 'approved' | 'revoked' | 'modified') => {
    setReview(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, status: action, reviewedBy: 'current-user@company.com', reviewedAt: new Date() }
          : item
      ),
    }));
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRecommendationBadge = (rec: AccessReviewItem['recommendation']) => {
    const variants: Record<string, 'success' | 'danger' | 'warning'> = {
      approve: 'success',
      revoke: 'danger',
      modify: 'warning',
    };
    return <Badge variant={variants[rec]} size="xs">{rec}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Access Review</h3>
            <Badge variant="warning" size="sm">{review.items.filter(i => i.status === 'pending').length} Pending</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Clock className="w-4 h-4" />
            Due: {review.dueDate.toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500">Review Progress</span>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{review.progress}%</span>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${review.progress}%` }}
            />
          </div>
        </div>

        {/* Review Items */}
        <div className="space-y-3">
          {review.items.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border ${
                item.status === 'pending' ? 'border-neutral-200 dark:border-neutral-700' : 'border-neutral-100 dark:border-neutral-800 opacity-75'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">
                  {item.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-neutral-900 dark:text-white">{item.user}</span>
                    <Badge variant="secondary" size="xs">{item.role}</Badge>
                    {getRecommendationBadge(item.recommendation)}
                  </div>
                  <p className="text-sm text-neutral-500 mb-2">{item.email} • {item.department}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.resources.map((resource) => (
                      <Badge key={resource} variant="secondary" size="xs">{resource}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span>Last active: {item.lastActive.toLocaleDateString()}</span>
                    <span className={getRiskColor(item.riskScore)}>Risk Score: {item.riskScore}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {item.status === 'pending' ? (
                    <>
                      <Button variant="primary" size="sm" onClick={() => handleAction(item.id, 'approved')}>
                        <UserCheck className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAction(item.id, 'modified')}>
                        <UserCog className="w-4 h-4" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleAction(item.id, 'revoked')}>
                        <UserX className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Badge variant={item.status === 'approved' ? 'success' : item.status === 'revoked' ? 'danger' : 'warning'} size="sm">
                      {item.status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
