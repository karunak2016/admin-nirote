import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Layout } from './components/layout/Layout'

import { Login }          from './pages/Login'
import { Dashboard }      from './pages/Dashboard'
import { Products }       from './pages/Products'
import { ProductForm }    from './pages/ProductForm'
import { Categories }     from './pages/Categories'
import { Orders }         from './pages/Orders'
import { OrderDetail }    from './pages/OrderDetail'
import { Customers }      from './pages/Customers'
import { CustomerDetail } from './pages/CustomerDetail'
import { Coupons }        from './pages/Coupons'
import { Options }        from './pages/Options'
import { Campaigns }      from './pages/Campaigns'
import { Reviews }        from './pages/Reviews'
import { Returns }        from './pages/Returns'
import { Settings }       from './pages/Settings'
import { Analytics }          from './pages/Analytics'
import { ContactMessages }    from './pages/ContactMessages'
import { NewsletterSubscribers } from './pages/NewsletterSubscribers'

// CMS Pages
import { HomeSections }   from './pages/cms/HomeSections'
import { Banners }        from './pages/cms/Banners'
import { Navigation }     from './pages/cms/Navigation'
import { Testimonials }   from './pages/cms/Testimonials'
import { WhyChooseUs }    from './pages/cms/WhyChooseUs'
import { FaqManager }     from './pages/cms/FaqManager'
import { Policies }       from './pages/cms/Policies'
import { SeoSettings }    from './pages/cms/SeoSettings'
import { Theme }          from './pages/cms/Theme'
import { AboutPage }      from './pages/cms/AboutPage'
import { ContactPage }    from './pages/cms/ContactPage'
import { Popups }         from './pages/cms/Popups'
import { EmailTemplates } from './pages/cms/EmailTemplates'
import { CmsCollections } from './pages/cms/CmsCollections'
import { Instagram }      from './pages/cms/Instagram'
import { FooterSettings }    from './pages/cms/FooterSettings'
import { HomepageContent }  from './pages/cms/HomepageContent'
import { StoreIdentity }    from './pages/cms/StoreIdentity'

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <RequireAdmin>
              <Layout />
            </RequireAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="options" element={<Options />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="returns" element={<Returns />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="contacts" element={<ContactMessages />} />
          <Route path="newsletter" element={<NewsletterSubscribers />} />
          <Route path="settings" element={<Settings />} />

          {/* CMS Routes */}
          <Route path="cms/sections"    element={<HomeSections />} />
          <Route path="cms/banners"     element={<Banners />} />
          <Route path="cms/navigation"  element={<Navigation />} />
          <Route path="cms/testimonials" element={<Testimonials />} />
          <Route path="cms/why-choose-us" element={<WhyChooseUs />} />
          <Route path="cms/instagram"   element={<Instagram />} />
          <Route path="cms/faq"         element={<FaqManager />} />
          <Route path="cms/policies"    element={<Policies />} />
          <Route path="cms/seo"         element={<SeoSettings />} />
          <Route path="cms/theme"       element={<Theme />} />
          <Route path="cms/about"       element={<AboutPage />} />
          <Route path="cms/contact"     element={<ContactPage />} />
          <Route path="cms/popups"      element={<Popups />} />
          <Route path="cms/email-templates" element={<EmailTemplates />} />
          <Route path="cms/collections" element={<CmsCollections />} />
          <Route path="cms/footer"      element={<FooterSettings />} />
          <Route path="cms/homepage"    element={<HomepageContent />} />
          <Route path="cms/identity"    element={<StoreIdentity />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
