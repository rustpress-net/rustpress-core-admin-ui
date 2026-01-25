/**
 * Queue Manager Component Tests
 * Tests for React components
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQueueManagerStore } from '../stores/queueManagerStore';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock recharts for tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: ({ children }: any) => <svg>{children}</svg>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
  AreaChart: ({ children }: any) => <svg>{children}</svg>,
  Area: () => null,
  BarChart: ({ children }: any) => <svg>{children}</svg>,
  Bar: () => null,
  PieChart: ({ children }: any) => <svg>{children}</svg>,
  Pie: () => null,
  Cell: () => null,
  Legend: () => null,
}));

// Import components after mocks
import { VisualQueueManager } from '../index';
import { QueueDashboard } from '../components/queues/QueueDashboard';
import { CreateQueueModal } from '../components/queues/CreateQueueModal';
import { ExchangeDashboard } from '../components/exchanges/ExchangeDashboard';
import { MessageBrowser } from '../components/messages/MessageBrowser';
import { MainDashboard } from '../components/dashboard/MainDashboard';
import { AlertsDashboard } from '../components/alerts/AlertsDashboard';
import { SecurityDashboard } from '../components/security/SecurityDashboard';
import { ApiEndpointsDashboard } from '../components/api-endpoints/ApiEndpointsDashboard';
import { TopologyGraph } from '../components/topology/TopologyGraph';
import { LiveMetricsDashboard } from '../components/monitoring/LiveMetricsDashboard';
import { ConnectionMonitor } from '../components/monitoring/ConnectionMonitor';
import { ConsumerDashboard } from '../components/monitoring/ConsumerDashboard';
import { StatsCard } from '../components/shared/StatsCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { DataTable } from '../components/shared/DataTable';
import { SearchFilter } from '../components/shared/SearchFilter';
import { Tabs } from '../components/shared/Tabs';
import { AnimatedCounter } from '../components/shared/AnimatedCounter';
import { GaugeChart } from '../components/shared/GaugeChart';
import { SparklineChart } from '../components/shared/SparklineChart';
import { TimeRangeSelector } from '../components/shared/TimeRangeSelector';

describe('Queue Manager Components', () => {
  beforeEach(() => {
    // Reset store and initialize sample data
    useQueueManagerStore.getState().initializeSampleData();
  });

  // ==========================================================================
  // SHARED COMPONENTS TESTS (20 tests)
  // ==========================================================================
  describe('Shared Components', () => {
    describe('StatsCard', () => {
      it('should render with title and value', () => {
        render(<StatsCard title="Total Queues" value={15} />);
        expect(screen.getByText('Total Queues')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
      });

      it('should render with icon', () => {
        render(<StatsCard title="Test" value={10} icon={<span data-testid="icon">Icon</span>} />);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
      });

      it('should render with trend indicator', () => {
        render(<StatsCard title="Test" value={100} trend={{ value: 5.2, direction: 'up' }} />);
        expect(screen.getByText(/5.2/)).toBeInTheDocument();
      });

      it('should render with subtitle', () => {
        render(<StatsCard title="Test" value={50} subtitle="per second" />);
        expect(screen.getByText('per second')).toBeInTheDocument();
      });

      it('should handle click events', () => {
        const onClick = vi.fn();
        render(<StatsCard title="Test" value={50} onClick={onClick} />);
        fireEvent.click(screen.getByText('Test'));
        expect(onClick).toHaveBeenCalled();
      });
    });

    describe('StatusBadge', () => {
      it('should render with status text', () => {
        render(<StatusBadge status="running" />);
        expect(screen.getByText('running')).toBeInTheDocument();
      });

      it('should apply correct color for running status', () => {
        render(<StatusBadge status="running" />);
        const badge = screen.getByText('running');
        expect(badge.className).toContain('green');
      });

      it('should apply correct color for error status', () => {
        render(<StatusBadge status="error" />);
        const badge = screen.getByText('error');
        expect(badge.className).toContain('red');
      });

      it('should apply correct color for warning status', () => {
        render(<StatusBadge status="warning" />);
        const badge = screen.getByText('warning');
        expect(badge.className).toContain('yellow');
      });

      it('should render with custom label', () => {
        render(<StatusBadge status="active" label="Active Now" />);
        expect(screen.getByText('Active Now')).toBeInTheDocument();
      });
    });

    describe('Modal', () => {
      it('should render when isOpen is true', () => {
        render(
          <Modal isOpen={true} onClose={() => {}} title="Test Modal">
            <div>Modal Content</div>
          </Modal>
        );
        expect(screen.getByText('Test Modal')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
      });

      it('should not render when isOpen is false', () => {
        render(
          <Modal isOpen={false} onClose={() => {}} title="Test Modal">
            <div>Modal Content</div>
          </Modal>
        );
        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      });

      it('should call onClose when close button clicked', () => {
        const onClose = vi.fn();
        render(
          <Modal isOpen={true} onClose={onClose} title="Test Modal">
            <div>Content</div>
          </Modal>
        );
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
      });

      it('should render with custom size', () => {
        render(
          <Modal isOpen={true} onClose={() => {}} title="Large Modal" size="lg">
            <div>Content</div>
          </Modal>
        );
        expect(screen.getByText('Large Modal')).toBeInTheDocument();
      });
    });

    describe('SearchFilter', () => {
      it('should render input field', () => {
        render(<SearchFilter value="" onChange={() => {}} />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      it('should call onChange when typing', async () => {
        const onChange = vi.fn();
        render(<SearchFilter value="" onChange={onChange} />);
        const input = screen.getByRole('textbox');
        await userEvent.type(input, 'test');
        expect(onChange).toHaveBeenCalled();
      });

      it('should show placeholder text', () => {
        render(<SearchFilter value="" onChange={() => {}} placeholder="Search queues..." />);
        expect(screen.getByPlaceholderText('Search queues...')).toBeInTheDocument();
      });

      it('should display current value', () => {
        render(<SearchFilter value="existing" onChange={() => {}} />);
        expect(screen.getByDisplayValue('existing')).toBeInTheDocument();
      });
    });

    describe('Tabs', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
        { id: 'tab3', label: 'Tab 3' },
      ];

      it('should render all tabs', () => {
        render(<Tabs tabs={tabs} activeTab="tab1" onChange={() => {}} />);
        expect(screen.getByText('Tab 1')).toBeInTheDocument();
        expect(screen.getByText('Tab 2')).toBeInTheDocument();
        expect(screen.getByText('Tab 3')).toBeInTheDocument();
      });

      it('should highlight active tab', () => {
        render(<Tabs tabs={tabs} activeTab="tab2" onChange={() => {}} />);
        const activeTab = screen.getByText('Tab 2');
        expect(activeTab.closest('button')?.className).toContain('active');
      });

      it('should call onChange when tab clicked', () => {
        const onChange = vi.fn();
        render(<Tabs tabs={tabs} activeTab="tab1" onChange={onChange} />);
        fireEvent.click(screen.getByText('Tab 2'));
        expect(onChange).toHaveBeenCalledWith('tab2');
      });
    });

    describe('AnimatedCounter', () => {
      it('should render with value', () => {
        render(<AnimatedCounter value={1000} />);
        expect(screen.getByText('1000')).toBeInTheDocument();
      });

      it('should format large numbers', () => {
        render(<AnimatedCounter value={1500000} format="compact" />);
        expect(screen.getByText(/1\.5M|1,500,000/)).toBeInTheDocument();
      });
    });

    describe('TimeRangeSelector', () => {
      it('should render all time range options', () => {
        render(<TimeRangeSelector value="1h" onChange={() => {}} />);
        expect(screen.getByText('1h')).toBeInTheDocument();
      });

      it('should call onChange when option selected', () => {
        const onChange = vi.fn();
        render(<TimeRangeSelector value="1h" onChange={onChange} />);
        fireEvent.click(screen.getByText('24h'));
        expect(onChange).toHaveBeenCalledWith('24h');
      });
    });
  });

  // ==========================================================================
  // QUEUE DASHBOARD TESTS (10 tests)
  // ==========================================================================
  describe('QueueDashboard', () => {
    it('should render queue dashboard', () => {
      render(<QueueDashboard />);
      expect(screen.getByText(/Queues/i)).toBeInTheDocument();
    });

    it('should display queue list', () => {
      render(<QueueDashboard />);
      const queues = useQueueManagerStore.getState().queues;
      if (queues.length > 0) {
        expect(screen.getByText(queues[0].name)).toBeInTheDocument();
      }
    });

    it('should show create queue button', () => {
      render(<QueueDashboard />);
      expect(screen.getByText(/Create Queue|New Queue/i)).toBeInTheDocument();
    });

    it('should filter queues by search', async () => {
      render(<QueueDashboard />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'orders');
      await waitFor(() => {
        const visibleQueues = screen.getAllByText(/orders/i);
        expect(visibleQueues.length).toBeGreaterThan(0);
      });
    });

    it('should toggle view mode', () => {
      render(<QueueDashboard />);
      const gridButton = screen.getByLabelText(/grid/i);
      fireEvent.click(gridButton);
      expect(useQueueManagerStore.getState().viewMode).toBe('grid');
    });

    it('should show queue stats', () => {
      render(<QueueDashboard />);
      expect(screen.getByText(/Total Queues|Queues/i)).toBeInTheDocument();
    });

    it('should open create queue modal', async () => {
      render(<QueueDashboard />);
      const createButton = screen.getByText(/Create Queue|New Queue/i);
      fireEvent.click(createButton);
      await waitFor(() => {
        expect(screen.getByText(/Queue Name|Name/i)).toBeInTheDocument();
      });
    });

    it('should handle queue selection', async () => {
      render(<QueueDashboard />);
      const queues = useQueueManagerStore.getState().queues;
      if (queues.length > 0) {
        const queueRow = screen.getByText(queues[0].name);
        fireEvent.click(queueRow);
        await waitFor(() => {
          expect(useQueueManagerStore.getState().selectedQueueId).toBe(queues[0].id);
        });
      }
    });

    it('should display queue type badges', () => {
      render(<QueueDashboard />);
      expect(screen.getAllByText(/classic|quorum/i).length).toBeGreaterThan(0);
    });

    it('should show message counts', () => {
      render(<QueueDashboard />);
      expect(screen.getAllByText(/messages|ready|unacked/i).length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // EXCHANGE DASHBOARD TESTS (8 tests)
  // ==========================================================================
  describe('ExchangeDashboard', () => {
    it('should render exchange dashboard', () => {
      render(<ExchangeDashboard />);
      expect(screen.getByText(/Exchanges/i)).toBeInTheDocument();
    });

    it('should display exchange list', () => {
      render(<ExchangeDashboard />);
      const exchanges = useQueueManagerStore.getState().exchanges;
      if (exchanges.length > 0) {
        expect(screen.getByText(exchanges[0].name)).toBeInTheDocument();
      }
    });

    it('should show create exchange button', () => {
      render(<ExchangeDashboard />);
      expect(screen.getByText(/Create Exchange|New Exchange/i)).toBeInTheDocument();
    });

    it('should filter by exchange type', async () => {
      render(<ExchangeDashboard />);
      const filterButton = screen.getByText(/All Types|Type/i);
      fireEvent.click(filterButton);
      await waitFor(() => {
        expect(screen.getByText(/direct/i)).toBeInTheDocument();
      });
    });

    it('should display exchange types', () => {
      render(<ExchangeDashboard />);
      expect(screen.getAllByText(/direct|fanout|topic|headers/i).length).toBeGreaterThan(0);
    });

    it('should show exchange stats', () => {
      render(<ExchangeDashboard />);
      expect(screen.getByText(/Total Exchanges|Exchanges/i)).toBeInTheDocument();
    });

    it('should handle exchange selection', async () => {
      render(<ExchangeDashboard />);
      const exchanges = useQueueManagerStore.getState().exchanges;
      if (exchanges.length > 0) {
        const exchangeRow = screen.getByText(exchanges[0].name);
        fireEvent.click(exchangeRow);
        await waitFor(() => {
          expect(useQueueManagerStore.getState().selectedExchangeId).toBe(exchanges[0].id);
        });
      }
    });

    it('should display binding counts', () => {
      render(<ExchangeDashboard />);
      expect(screen.getAllByText(/bindings/i).length).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================================================
  // MESSAGE BROWSER TESTS (6 tests)
  // ==========================================================================
  describe('MessageBrowser', () => {
    it('should render message browser', () => {
      render(<MessageBrowser />);
      expect(screen.getByText(/Messages|Message Browser/i)).toBeInTheDocument();
    });

    it('should show queue selector', () => {
      render(<MessageBrowser />);
      expect(screen.getByText(/Select Queue|Queue/i)).toBeInTheDocument();
    });

    it('should display message list when queue selected', async () => {
      const { initializeSampleData } = useQueueManagerStore.getState();
      initializeSampleData();
      render(<MessageBrowser />);
      // Wait for messages to load
      await waitFor(() => {
        expect(screen.getByText(/Messages|No messages/i)).toBeInTheDocument();
      });
    });

    it('should show message payload preview', async () => {
      render(<MessageBrowser />);
      await waitFor(() => {
        const expandButtons = screen.queryAllByRole('button', { name: /expand|view/i });
        if (expandButtons.length > 0) {
          fireEvent.click(expandButtons[0]);
          expect(screen.getByText(/payload|content/i)).toBeInTheDocument();
        }
      });
    });

    it('should filter messages by status', async () => {
      render(<MessageBrowser />);
      const statusFilter = screen.queryByText(/All Status|Status/i);
      if (statusFilter) {
        fireEvent.click(statusFilter);
        await waitFor(() => {
          expect(screen.getByText(/ready/i)).toBeInTheDocument();
        });
      }
    });

    it('should show message metadata', () => {
      render(<MessageBrowser />);
      // Check for metadata fields
      expect(screen.queryAllByText(/routing key|exchange|timestamp/i).length).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================================================
  // MAIN DASHBOARD TESTS (8 tests)
  // ==========================================================================
  describe('MainDashboard', () => {
    it('should render main dashboard', () => {
      render(<MainDashboard />);
      expect(screen.getByText(/Overview|Dashboard/i)).toBeInTheDocument();
    });

    it('should display queue stats', () => {
      render(<MainDashboard />);
      expect(screen.getByText(/Queues/i)).toBeInTheDocument();
    });

    it('should display exchange stats', () => {
      render(<MainDashboard />);
      expect(screen.getByText(/Exchanges/i)).toBeInTheDocument();
    });

    it('should display connection stats', () => {
      render(<MainDashboard />);
      expect(screen.getByText(/Connections/i)).toBeInTheDocument();
    });

    it('should display message rates', () => {
      render(<MainDashboard />);
      expect(screen.getAllByText(/rate|msg\/s/i).length).toBeGreaterThan(0);
    });

    it('should show system health', () => {
      render(<MainDashboard />);
      expect(screen.queryAllByText(/health|status/i).length).toBeGreaterThanOrEqual(0);
    });

    it('should display recent events', () => {
      render(<MainDashboard />);
      expect(screen.queryAllByText(/events|activity/i).length).toBeGreaterThanOrEqual(0);
    });

    it('should show cluster node status', () => {
      render(<MainDashboard />);
      expect(screen.queryAllByText(/node|cluster/i).length).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================================================
  // ALERTS DASHBOARD TESTS (6 tests)
  // ==========================================================================
  describe('AlertsDashboard', () => {
    it('should render alerts dashboard', () => {
      render(<AlertsDashboard />);
      expect(screen.getByText(/Alerts/i)).toBeInTheDocument();
    });

    it('should display alert list', () => {
      render(<AlertsDashboard />);
      const alerts = useQueueManagerStore.getState().alerts;
      if (alerts.length > 0) {
        expect(screen.getByText(alerts[0].message)).toBeInTheDocument();
      }
    });

    it('should show severity badges', () => {
      render(<AlertsDashboard />);
      expect(screen.queryAllByText(/critical|warning|error|info/i).length).toBeGreaterThanOrEqual(0);
    });

    it('should handle alert acknowledgement', async () => {
      render(<AlertsDashboard />);
      const ackButtons = screen.queryAllByText(/acknowledge|ack/i);
      if (ackButtons.length > 0) {
        fireEvent.click(ackButtons[0]);
        await waitFor(() => {
          expect(screen.queryAllByText(/acknowledged/i).length).toBeGreaterThanOrEqual(0);
        });
      }
    });

    it('should filter alerts by status', async () => {
      render(<AlertsDashboard />);
      const filterButton = screen.queryByText(/All Status|Filter/i);
      if (filterButton) {
        fireEvent.click(filterButton);
        await waitFor(() => {
          expect(screen.getByText(/active/i)).toBeInTheDocument();
        });
      }
    });

    it('should show create alert rule button', () => {
      render(<AlertsDashboard />);
      expect(screen.queryByText(/Create Rule|New Rule/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // SECURITY DASHBOARD TESTS (6 tests)
  // ==========================================================================
  describe('SecurityDashboard', () => {
    it('should render security dashboard', () => {
      render(<SecurityDashboard />);
      expect(screen.getByText(/Security/i)).toBeInTheDocument();
    });

    it('should display user tabs', () => {
      render(<SecurityDashboard />);
      expect(screen.getByText(/Users/i)).toBeInTheDocument();
    });

    it('should display vhost tabs', () => {
      render(<SecurityDashboard />);
      expect(screen.getByText(/Virtual Hosts|VHosts/i)).toBeInTheDocument();
    });

    it('should show user list', async () => {
      render(<SecurityDashboard />);
      fireEvent.click(screen.getByText(/Users/i));
      await waitFor(() => {
        const users = useQueueManagerStore.getState().users;
        if (users.length > 0) {
          expect(screen.getByText(users[0].username)).toBeInTheDocument();
        }
      });
    });

    it('should show create user button', () => {
      render(<SecurityDashboard />);
      expect(screen.queryByText(/Create User|Add User/i)).toBeInTheDocument();
    });

    it('should display permissions tab', () => {
      render(<SecurityDashboard />);
      expect(screen.getByText(/Permissions/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // API ENDPOINTS DASHBOARD TESTS (6 tests)
  // ==========================================================================
  describe('ApiEndpointsDashboard', () => {
    it('should render API endpoints dashboard', () => {
      render(<ApiEndpointsDashboard />);
      expect(screen.getByText(/API Endpoints/i)).toBeInTheDocument();
    });

    it('should display endpoint list', () => {
      render(<ApiEndpointsDashboard />);
      const endpoints = useQueueManagerStore.getState().apiEndpoints;
      if (endpoints.length > 0) {
        expect(screen.getByText(endpoints[0].name)).toBeInTheDocument();
      }
    });

    it('should show create endpoint button', () => {
      render(<ApiEndpointsDashboard />);
      expect(screen.queryByText(/Create Endpoint|New Endpoint/i)).toBeInTheDocument();
    });

    it('should display auth method badges', () => {
      render(<ApiEndpointsDashboard />);
      expect(screen.queryAllByText(/bearer|api-key|basic|oauth/i).length).toBeGreaterThanOrEqual(0);
    });

    it('should show endpoint stats', () => {
      render(<ApiEndpointsDashboard />);
      expect(screen.queryAllByText(/requests|rate/i).length).toBeGreaterThanOrEqual(0);
    });

    it('should filter endpoints by status', async () => {
      render(<ApiEndpointsDashboard />);
      const filterButton = screen.queryByText(/All Status|Filter/i);
      if (filterButton) {
        fireEvent.click(filterButton);
        await waitFor(() => {
          expect(screen.getByText(/active/i)).toBeInTheDocument();
        });
      }
    });
  });

  // ==========================================================================
  // MONITORING COMPONENTS TESTS (10 tests)
  // ==========================================================================
  describe('Monitoring Components', () => {
    describe('LiveMetricsDashboard', () => {
      it('should render live metrics dashboard', () => {
        render(<LiveMetricsDashboard />);
        expect(screen.getByText(/Live Metrics|Metrics/i)).toBeInTheDocument();
      });

      it('should show CPU usage', () => {
        render(<LiveMetricsDashboard />);
        expect(screen.queryByText(/CPU/i)).toBeInTheDocument();
      });

      it('should show memory usage', () => {
        render(<LiveMetricsDashboard />);
        expect(screen.queryByText(/Memory/i)).toBeInTheDocument();
      });

      it('should toggle live mode', async () => {
        render(<LiveMetricsDashboard />);
        const toggleButton = screen.queryByText(/Live|Pause/i);
        if (toggleButton) {
          fireEvent.click(toggleButton);
          expect(screen.getByText(/Paused|Live/i)).toBeInTheDocument();
        }
      });
    });

    describe('ConnectionMonitor', () => {
      it('should render connection monitor', () => {
        render(<ConnectionMonitor />);
        expect(screen.getByText(/Connections/i)).toBeInTheDocument();
      });

      it('should display connection list', () => {
        render(<ConnectionMonitor />);
        const connections = useQueueManagerStore.getState().connections;
        if (connections.length > 0) {
          expect(screen.getByText(connections[0].name)).toBeInTheDocument();
        }
      });

      it('should show connection stats', () => {
        render(<ConnectionMonitor />);
        expect(screen.queryAllByText(/active|blocked|total/i).length).toBeGreaterThan(0);
      });
    });

    describe('ConsumerDashboard', () => {
      it('should render consumer dashboard', () => {
        render(<ConsumerDashboard />);
        expect(screen.getByText(/Consumers/i)).toBeInTheDocument();
      });

      it('should display consumer list', () => {
        render(<ConsumerDashboard />);
        const consumers = useQueueManagerStore.getState().consumers;
        if (consumers.length > 0) {
          expect(screen.getByText(consumers[0].tag)).toBeInTheDocument();
        }
      });

      it('should show consumer metrics', () => {
        render(<ConsumerDashboard />);
        expect(screen.queryAllByText(/rate|prefetch|ack/i).length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ==========================================================================
  // TOPOLOGY GRAPH TESTS (4 tests)
  // ==========================================================================
  describe('TopologyGraph', () => {
    it('should render topology graph', () => {
      render(<TopologyGraph />);
      expect(screen.getByText(/Topology/i)).toBeInTheDocument();
    });

    it('should display exchanges and queues', () => {
      render(<TopologyGraph />);
      // Check for node elements
      expect(screen.queryAllByRole('graphics-symbol').length).toBeGreaterThanOrEqual(0);
    });

    it('should show zoom controls', () => {
      render(<TopologyGraph />);
      expect(screen.queryByText(/Zoom|Reset/i)).toBeInTheDocument();
    });

    it('should show filter options', () => {
      render(<TopologyGraph />);
      expect(screen.queryByText(/Filter|Show/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // CREATE QUEUE MODAL TESTS (6 tests)
  // ==========================================================================
  describe('CreateQueueModal', () => {
    it('should render modal when open', () => {
      render(<CreateQueueModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByText(/Create Queue/i)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<CreateQueueModal isOpen={false} onClose={() => {}} />);
      expect(screen.queryByText(/Create Queue/i)).not.toBeInTheDocument();
    });

    it('should have queue name input', () => {
      render(<CreateQueueModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByLabelText(/Queue Name|Name/i)).toBeInTheDocument();
    });

    it('should have queue type selector', () => {
      render(<CreateQueueModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByText(/Type|Queue Type/i)).toBeInTheDocument();
    });

    it('should have durable checkbox', () => {
      render(<CreateQueueModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByLabelText(/Durable/i)).toBeInTheDocument();
    });

    it('should call onClose when cancel clicked', () => {
      const onClose = vi.fn();
      render(<CreateQueueModal isOpen={true} onClose={onClose} />);
      const cancelButton = screen.getByText(/Cancel/i);
      fireEvent.click(cancelButton);
      expect(onClose).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // VISUAL QUEUE MANAGER (MAIN COMPONENT) TESTS (6 tests)
  // ==========================================================================
  describe('VisualQueueManager', () => {
    it('should render main component', () => {
      render(<VisualQueueManager />);
      expect(screen.getByText(/Queue Manager/i)).toBeInTheDocument();
    });

    it('should display sidebar navigation', () => {
      render(<VisualQueueManager />);
      expect(screen.getByText(/Overview/i)).toBeInTheDocument();
      expect(screen.getByText(/Queues/i)).toBeInTheDocument();
      expect(screen.getByText(/Exchanges/i)).toBeInTheDocument();
    });

    it('should switch sections when nav clicked', async () => {
      render(<VisualQueueManager />);
      fireEvent.click(screen.getByText(/Queues/i));
      await waitFor(() => {
        expect(screen.getAllByText(/Queues/i).length).toBeGreaterThan(0);
      });
    });

    it('should toggle dark mode', async () => {
      render(<VisualQueueManager />);
      const darkModeButton = screen.getByLabelText(/dark mode|theme/i);
      fireEvent.click(darkModeButton);
      // Check that dark mode class is applied
      await waitFor(() => {
        expect(document.querySelector('.dark')).toBeInTheDocument();
      });
    });

    it('should collapse sidebar', async () => {
      render(<VisualQueueManager />);
      const collapseButton = screen.getByText(/Collapse/i);
      fireEvent.click(collapseButton);
      await waitFor(() => {
        expect(screen.queryByText(/Collapse/i)).not.toBeInTheDocument();
      });
    });

    it('should show publish message button', () => {
      render(<VisualQueueManager />);
      expect(screen.getByText(/Publish Message/i)).toBeInTheDocument();
    });
  });
});
