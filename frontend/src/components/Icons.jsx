import React from 'react';
import {
  ShieldCheck as LucideShieldCheck,
  AlertTriangle as LucideAlertTriangle,
  FileText as LucideFileText,
  Activity as LucideActivity,
  Users as LucideUsers,
  Eye as LucideEye,
  CheckCircle as LucideCheckCircle,
  XCircle as LucideXCircle,
  Search as LucideSearch,
  Lock as LucideLock,
  Sparkles as LucideSparkles,
  Cpu as LucideCpu,
  Network as LucideNetwork,
  Database as LucideDatabase,
  RefreshCw as LucideRefreshCw,
  ExternalLink as LucideExternalLink,
  Download as LucideDownload,
  Filter as LucideFilter,
  ChevronRight as LucideChevronRight,
  Scale as LucideScale,
  UploadCloud as LucideUploadCloud,
  Clock as LucideClock,
  MapPin as LucideMapPin,
  Building as LucideBuilding,
  Building2 as LucideBuilding2,
  CreditCard as LucideCreditCard,
  User as LucideUser,
  LogOut as LucideLogOut,
  Bell as LucideBell,
  Plus as LucidePlus,
  ArrowRight as LucideArrowRight,
  Inbox as LucideInbox,
  Hash as LucideHash,
  Calendar as LucideCalendar,
  Bot as LucideBot,
  Sliders as LucideSliders,
  Layers as LucideLayers,
  Send as LucideSend,
  Check as LucideCheck,
  Mail as LucideMail,
  EyeOff as LucideEyeOff,
} from 'lucide-react';

const createIcon = (Component) => {
  return function IconWrapper({ className = '', size, style, ...props }) {
    return (
      <Component
        size={size || 18}
        className={className}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          ...style,
        }}
        {...props}
      />
    );
  };
};

export const ShieldCheck = createIcon(LucideShieldCheck);
export const AlertTriangle = createIcon(LucideAlertTriangle);
export const FileText = createIcon(LucideFileText);
export const Activity = createIcon(LucideActivity);
export const Users = createIcon(LucideUsers);
export const Eye = createIcon(LucideEye);
export const CheckCircle = createIcon(LucideCheckCircle);
export const XCircle = createIcon(LucideXCircle);
export const Search = createIcon(LucideSearch);
export const Lock = createIcon(LucideLock);
export const Sparkles = createIcon(LucideSparkles);
export const Cpu = createIcon(LucideCpu);
export const Network = createIcon(LucideNetwork);
export const Database = createIcon(LucideDatabase);
export const RefreshCw = createIcon(LucideRefreshCw);
export const ExternalLink = createIcon(LucideExternalLink);
export const Download = createIcon(LucideDownload);
export const Filter = createIcon(LucideFilter);
export const ChevronRight = createIcon(LucideChevronRight);
export const Scale = createIcon(LucideScale);
export const UploadCloud = createIcon(LucideUploadCloud);
export const Clock = createIcon(LucideClock);
export const MapPin = createIcon(LucideMapPin);
export const Building = createIcon(LucideBuilding);
export const Building2 = createIcon(LucideBuilding2);
export const CreditCard = createIcon(LucideCreditCard);
export const User = createIcon(LucideUser);
export const LogOut = createIcon(LucideLogOut);
export const Bell = createIcon(LucideBell);
export const Plus = createIcon(LucidePlus);
export const ArrowRight = createIcon(LucideArrowRight);
export const Inbox = createIcon(LucideInbox);
export const Hash = createIcon(LucideHash);
export const Calendar = createIcon(LucideCalendar);
export const Bot = createIcon(LucideBot);
export const Sliders = createIcon(LucideSliders);
export const Layers = createIcon(LucideLayers);
export const Send = createIcon(LucideSend);
export const Check = createIcon(LucideCheck);
export const Mail = createIcon(LucideMail);
export const EyeOff = createIcon(LucideEyeOff);

export default {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Lock,
  Sparkles,
  Cpu,
  Network,
  Database,
  RefreshCw,
  ExternalLink,
  Download,
  Filter,
  ChevronRight,
  Scale,
  UploadCloud,
  Clock,
  MapPin,
  Building,
  Building2,
  CreditCard,
  User,
  LogOut,
  Bell,
  Plus,
  ArrowRight,
  Inbox,
  Hash,
  Calendar,
  Bot,
  Sliders,
  Layers,
  Send,
  Check,
  Mail,
  EyeOff,
};
