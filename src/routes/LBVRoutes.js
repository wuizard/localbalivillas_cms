import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import MainLayout from 'layout/MainLayout';
import { Navigate } from 'react-router';
import { reactLocalStorage } from 'reactjs-localstorage';
import AdminDetail from 'pages/_lbv/admin/AdminDetail';
import { isSuperAdmin } from 'helper/role';
import Admins from 'pages/_lbv/admin/Admins';

// render - dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard')));

// render - utilities
const Places = Loadable(lazy(() => import('pages/_lbv/places/Places')));
const Drafts = Loadable(lazy(() => import('pages/_lbv/places/Drafts')));
const AddPlaces = Loadable(lazy(() => import('pages/_lbv/places/AddPlaces')));
const Bookings = Loadable(lazy(() => import('pages/_lbv/booking/Booking')));
const BookingDetail = Loadable(lazy(() => import('pages/_lbv/booking/BookingDetail')));

const Region = Loadable(lazy(() => import('pages/_lbv/region/Regions')));
const Location = Loadable(lazy(() => import('pages/_lbv/region/Locations')));
const Categories = Loadable(lazy(() => import('pages/_lbv/category/Categories')));

const Coupons = Loadable(lazy(() => import('pages/_lbv/coupon/Coupons')))
const CouponDetail = Loadable(lazy(() => import('pages/_lbv/coupon/CouponDetail')))

const Activities = Loadable(lazy(() => import('pages/_lbv/activities/Activities')));
const ActivityDrafts = Loadable(lazy(() => import('pages/_lbv/activities/Drafts')));
const AddActivity = Loadable(lazy(() => import('pages/_lbv/activities/AddActivity')));
const ActivityOrders = Loadable(lazy(() => import('pages/_lbv/activities/ActivityOrders')));
const ActivityOrderDetail = Loadable(lazy(() => import('pages/_lbv/activities/ActivityOrderDetail')));

const EventPackages = Loadable(lazy(() => import('pages/_lbv/events/EventPackages')));
const AddEventPackage = Loadable(lazy(() => import('pages/_lbv/events/AddEventPackage')));

const Enquiries = Loadable(lazy(() => import('pages/_lbv/enquiries/Enquiries')));
const EnquiryDetail = Loadable(lazy(() => import('pages/_lbv/enquiries/EnquiryDetail')));

// ==============================|| MAIN ROUTING ||============================== //

const isLoggedIn = reactLocalStorage.get('lbv_admin_token');

let PlaceRoutes = {
  path: 'places',
  children: [
    {
      path: '',
      element: <Places />
    },
    {
      // must be declared before ':id' or it is swallowed by the id route
      path: 'drafts',
      element: <Drafts />
    },
    {
      path: 'add-place',
      element: <AddPlaces />
    },
    {
      path: ':id',
      element: <AddPlaces />
    }
  ]
}

let ActivityRoutes = {
  path: 'activities',
  children: [
    {
      path: '',
      element: <Activities />
    },
    {
      // must be declared before ':id' or it is swallowed by the id route
      path: 'drafts',
      element: <ActivityDrafts />
    },
    {
      path: 'add-activity',
      element: <AddActivity />
    },
    {
      path: ':id',
      element: <AddActivity />
    }
  ]
}

let EventRoutes = {
  path: 'events',
  children: [
    {
      path: '',
      element: <EventPackages />
    },
    {
      // before ':id', same trap as activities/drafts
      path: 'add-event',
      element: <AddEventPackage />
    },
    {
      path: ':id',
      element: <AddEventPackage />
    }
  ]
}

let SuperAdminSettings = {
  path: 'setting',
  children: [
    {
      path: 'region',
      element: <Region />
    },
    {
      path: 'location',
      element: <Location />
    },
    {
      path: 'categories',
      element: <Categories />
    },
    {
      path: 'admins',
      children: [
        {
          path: '',
          element: <Admins />
        },
        {
          path: 'add-admin',
          element: <AdminDetail />
        },
        {
          // was <CouponDetail /> - editing an admin opened the coupon form
          path: ':id',
          element: <AdminDetail />
        }
      ]
    },
  ]
}

let LBVRoutes = {
  path: '/',
  element: isLoggedIn ? <MainLayout /> : <Navigate to="/login" />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    // {
    //   path: 'dashboard',
    //   children: [
    //     {
    //       path: 'default',
    //       element: <DashboardDefault />
    //     }
    //   ]
    // },
    {
      path: 'dashboard',
      element: <DashboardDefault />
    },
    {
      path: 'order',
      children: [
        {
          path: '',
          element: <Bookings />
        },
        {
          path: ':id',
          element: <BookingDetail />
        },
      ]
    },
    {
      path: 'activity-orders',
      children: [
        {
          path: '',
          element: <ActivityOrders />
        },
        {
          path: ':id',
          element: <ActivityOrderDetail />
        },
      ]
    },
    {
      path: 'enquiries',
      children: [
        {
          path: '',
          element: <Enquiries />
        },
        {
          path: ':id',
          element: <EnquiryDetail />
        },
      ]
    },
    {
      path: 'coupons',
      children: [
        {
          path: '',
          element: <Coupons />
        },
        {
          path: 'add-coupon',
          element: <CouponDetail />
        },
        {
          path: ':id',
          element: <CouponDetail />
        }
      ]
    },
  ]
};

if (isSuperAdmin()) {
  LBVRoutes.children.unshift(PlaceRoutes)
  LBVRoutes.children.push(ActivityRoutes)
  LBVRoutes.children.push(EventRoutes)
  LBVRoutes.children.push(SuperAdminSettings)
}

export default LBVRoutes;
