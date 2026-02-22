import EcommerceMetrics from "../components/Dashboard/EcommerceMetrics";
import MonthlySalesChart from "../components/Dashboard/MonthlySalesChart";
import StatisticsChart from "../components/Dashboard/StatisticsChart";
import MonthlyTarget from "../components/Dashboard/MonthlyTarget";
import RecentOrders from "../components/Dashboard/RecentOrders";
import DemographicCard from "../components/Dashboard/DemographicCard";
import PageMeta from "../components/common/PageMeta";

const Dashboard = () => {
  return (
    <>
      <PageMeta
        title="Dashboard | Grievance Litigation System"
        description="Grievance Litigation System Dashboard"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
