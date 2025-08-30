// Data seeds
const subscriptions = [
  { id: "spotify", name: "Spotify", price: 5.99, badge: "S", class: "spotify", due: { day: 3, type: "monthly" }, status: "active" },
  {
    id: "youtube",
    name: "YouTube Premium",
    price: 18.99,
    badge: "YT",
    class: "youtube",
    alert: true,
    due: { day: 12, type: "monthly" },
    status: "payment_due"
  },
  {
    id: "amazon",
    name: "Amazon Prime Video",
    price: 6.99,
    badge: "A",
    class: "amazon",
    due: { day: 15, type: "yearly" },
    status: "active"
  },
  { id: "dropbox", name: "Dropbox", price: 11.99, badge: "DB", class: "dropbox", due: { day: 20, type: "monthly" }, status: "active" },
  { id: "adobe", name: "Adobe", price: 20.99, badge: "A", class: "adobe", due: { day: 26, type: "monthly" }, status: "expired" },
]

const txAll = [
  { icon: "SB", brandClass: "spotify", name: "Starbucks", time: "20:14", year: "2014", amount: 5.5 },
  {
    icon: "OS",
    brandClass: "dropbox",
    name: "Online Store",
    time: "20:14",
    year: "2017",
    amount: 32.9,
    renew: "Oct 26",
  },
  {
    icon: "OS",
    brandClass: "dropbox",
    name: "Online Store",
    time: "20:14",
    year: "2017",
    amount: 32.99,
    renew: "Oct 26",
  },
  { icon: "AM", brandClass: "amazon", name: "Amazon", time: "20:14", year: "2013", amount: -20.0, renew: "Oct 26" },
  { icon: "AM", brandClass: "amazon", name: "Amazon", time: "20:14", year: "2015", amount: -50.0, renew: "Oct 26" },
]

const txUpcoming = [
  {
    icon: "NF",
    brandClass: "netflix",
    name: "Netflix Renewal",
    time: "Thu",
    year: "",
    amount: -18.99,
    renew: "Oct 15",
  },
]

const notifications = [
  { id: 1, icon: "🔔", title: "Payment Reminder", text: "Your Spotify subscription payment is due tomorrow. Amount: ₹59", unread: true, type: "payment_reminder" },
  { id: 2, icon: "🧾", title: "Payment Posted", text: "Your Netflix subscription payment has been processed successfully. Amount: ₹199", unread: true, type: "payment_posted" },
  { id: 3, icon: "📅", title: "Upcoming Bill", text: "Don't forget your Adobe Creative Cloud subscription is due on the 26th. Amount: ₹1999", unread: false, type: "upcoming_bill" },
]

// Authentication state
let isLoggedIn = false
let currentUser = null

// Check if user is logged in on app start
function checkAuthStatus() {
  if (typeof Android !== 'undefined') {
    const userData = Android.getUserData()
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.email && user.name) {
          isLoggedIn = true
          currentUser = user
          return true
        }
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
  }
  return false
}

// SPA Navigation
const screens = Array.from(document.querySelectorAll(".screen"))
function showScreen(id) {
  screens.forEach((s) => s.classList.toggle("active", s.id === id))
  const bottomNav = document.getElementById("bottomNav")
  // hide nav on onboarding and auth screens
  bottomNav.style.display = (id === "screen-onboarding" || id === "screen-login" || id === "screen-signup") ? "none" : "flex"
  // mark active tab if applicable
  document.querySelectorAll(".bottom-nav .nav-btn").forEach((btn) => {
    const target = btn.getAttribute("data-nav")
    btn.classList.toggle("active", target === id)
  })
  window.scrollTo({ top: 0, behavior: "instant" })
}

// Wire navigation buttons
document.addEventListener("click", (e) => {
  const nav = e.target.closest("[data-nav]")
  if (nav) {
    e.preventDefault()
    const target = nav.getAttribute("data-nav")
    showScreen(target)
  }
})

// Onboarding actions
document.getElementById("btnGetStarted")?.addEventListener("click", () => {
  if (isLoggedIn) {
    showScreen("screen-dashboard")
  } else {
    showScreen("screen-signup")
  }
})
document.getElementById("btnHaveAccount")?.addEventListener("click", () => {
  if (isLoggedIn) {
    showScreen("screen-dashboard")
  } else {
    showScreen("screen-login")
  }
})

// Login functionality
document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault()
  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  if (typeof Android !== 'undefined') {
    const success = Android.loginUser(email, password)
    if (success) {
      isLoggedIn = true
      currentUser = { email, name: email.split('@')[0] }
      showScreen("screen-dashboard")
      updateProfileInfo()
    } else {
      alert("Invalid credentials. Please try again.")
    }
  } else {
    // Fallback for testing without Android bridge
    if (email && password) {
      isLoggedIn = true
      currentUser = { email, name: email.split('@')[0] }
      showScreen("screen-dashboard")
      updateProfileInfo()
    }
  }
})

// Signup functionality
document.getElementById("signupForm")?.addEventListener("submit", (e) => {
  e.preventDefault()
  const name = document.getElementById("signupName").value
  const email = document.getElementById("signupEmail").value
  const password = document.getElementById("signupPassword").value
  const confirmPassword = document.getElementById("signupConfirmPassword").value

  if (password !== confirmPassword) {
    alert("Passwords do not match!")
    return
  }

  if (typeof Android !== 'undefined') {
    const success = Android.registerUser(name, email, password)
    if (success) {
      isLoggedIn = true
      currentUser = { name, email }
      showScreen("screen-dashboard")
      updateProfileInfo()
    } else {
      alert("Registration failed. Please try again.")
    }
  } else {
    // Fallback for testing without Android bridge
    if (name && email && password) {
      isLoggedIn = true
      currentUser = { name, email }
      showScreen("screen-dashboard")
      updateProfileInfo()
    }
  }
})

// Logout functionality
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  if (typeof Android !== 'undefined') {
    Android.logoutUser()
  }
  isLoggedIn = false
  currentUser = null
  showScreen("screen-onboarding")
})

// Update profile information
function updateProfileInfo() {
  if (currentUser) {
    const nameElement = document.querySelector(".profile-info .name")
    const emailElement = document.querySelector(".profile-info .email")
    const avatarElement = document.querySelector(".avatar")

    if (nameElement) nameElement.textContent = currentUser.name
    if (emailElement) emailElement.textContent = currentUser.email
    if (avatarElement) avatarElement.textContent = currentUser.name.substring(0, 2).toUpperCase()
  }
}

// Tabs logic
function initTabs() {
  document.querySelectorAll("[data-tabs]").forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab")
      if (!btn) return
      group.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t === btn))
      const container = group.parentElement // closest card
      const targetSel = btn.getAttribute("data-tab-target")
      container.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", "#" + p.id === targetSel))
    })
  })
}
initTabs()

// Populate subscription lists
function subItemTemplate(s) {
  const statusClass = s.status === "active" ? "active" : s.status === "payment_due" ? "payment-due" : "expired"
  return `
    <li class="item subscription-item ${statusClass}" data-subscription-id="${s.id}">
      <div class="left">
        <div class="logo ${s.class}">${s.badge}</div>
        <div class="meta">
          <div class="service">${s.name}</div>
          <div class="muted small">${s.due?.type === "yearly" ? "Yearly" : "Monthly"}</div>
        </div>
      </div>
      <div class="price ${s.alert ? "alert" : ""}">$${s.price.toFixed(2)}</div>
    </li>
  `
}
function renderSubs() {
  const ul1 = document.getElementById("listDashboardSubs")
  const ul2 = document.getElementById("listDashboardUpcoming")
  const ul3 = document.getElementById("listSubsAll")
  const ul4 = document.getElementById("listSubsUpcoming")
  ul1.innerHTML = subscriptions.slice(0, 4).map(subItemTemplate).join("")
  ul2.innerHTML = subscriptions
    .filter((s) => s.due?.type === "monthly")
    .map(subItemTemplate)
    .join("")
  ul3.innerHTML = subscriptions.map(subItemTemplate).join("")
  ul4.innerHTML = subscriptions
    .filter((s) => s.due?.type === "monthly")
    .map(subItemTemplate)
    .join("")

  // Add click handlers for subscriptions
  addSubscriptionClickHandlers()

  // Update metrics
  updateMetrics()
}
renderSubs()

// Add subscription click handlers
function addSubscriptionClickHandlers() {
  document.querySelectorAll('[data-subscription-id]').forEach(item => {
    item.addEventListener('click', () => {
      const subscriptionId = item.getAttribute('data-subscription-id')
      const subscription = subscriptions.find(s => s.id === subscriptionId)
      if (subscription) {
        showSubscriptionModal(subscription)
      }
    })
  })
}

// Show subscription detail modal
function showSubscriptionModal(subscription) {
  const modal = document.getElementById("subscriptionModal")
  const modalTitle = document.getElementById("modalSubTitle")
  const modalDetails = document.getElementById("modalSubDetails")

  modalTitle.textContent = subscription.name

  const dueDate = new Date()
  dueDate.setDate(subscription.due.day)

  modalDetails.innerHTML = `
    <div class="subscription-detail-grid">
      <div class="detail-item">
        <div class="detail-label">Service Name</div>
        <div class="detail-value">${subscription.name}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Price</div>
        <div class="detail-value price">$${subscription.price.toFixed(2)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Billing Cycle</div>
        <div class="detail-value">${subscription.due.type === "yearly" ? "Yearly" : "Monthly"}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Due Date</div>
        <div class="detail-value">${dueDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Status</div>
        <div class="detail-value status-${subscription.status}">${subscription.status.replace('_', ' ').toUpperCase()}</div>
      </div>
    </div>
  `

  modal.classList.add("active")
}

// Update dashboard metrics
function updateMetrics() {
  const activeSubs = subscriptions.filter(s => s.status === "active").length
  const highestSub = Math.max(...subscriptions.map(s => s.price))
  const lowestSub = Math.min(...subscriptions.map(s => s.price))

  // Update metrics in the dashboard
  const metricsElements = document.querySelectorAll('.metric .k')
  if (metricsElements.length >= 3) {
    metricsElements[0].textContent = activeSubs
    metricsElements[1].textContent = `$${highestSub.toFixed(2)}`
    metricsElements[2].textContent = `$${lowestSub.toFixed(2)}`
  }
}

// Gauge progress
function drawGauge() {
  const arc = document.getElementById("gaugeArc")
  const activeSubs = subscriptions.filter(s => s.status === "active")
  const total = activeSubs.reduce((a, b) => a + b.price, 0)
  const cap = 1500 // arbitrary cap for demo
  const pct = Math.min(total / cap, 1)
  const CIRC = 2 * Math.PI * 52 // r=52
  const filled = CIRC * (1 - pct)
  arc.style.strokeDashoffset = filled.toString()
  document.getElementById("dashboardTotal").textContent =
    `$${(total).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

// Initialize gauge
drawGauge()

// Add budget button functionality
document.addEventListener('DOMContentLoaded', () => {
  const budgetBtn = document.querySelector('.btn-ghost.small')
  if (budgetBtn) {
    budgetBtn.addEventListener('click', () => {
      showBudgetModal()
    })
  }
})

// Show budget modal
function showBudgetModal() {
  const activeSubs = subscriptions.filter(s => s.status === "active")
  const monthlyTotal = activeSubs.filter(s => s.due.type === "monthly").reduce((sum, s) => sum + s.price, 0)
  const yearlyTotal = activeSubs.filter(s => s.due.type === "yearly").reduce((sum, s) => sum + s.price, 0)

  // Create a simple budget overview
  const budgetInfo = `
    <div class="budget-overview">
      <h4 style="margin-bottom: 16px; color: var(--accent);">Budget Overview</h4>
      <div class="budget-item">
        <span>Active Subscriptions:</span>
        <strong>${activeSubs.length}</strong>
      </div>
      <div class="budget-item">
        <span>Monthly Total:</span>
        <strong>$${monthlyTotal.toFixed(2)}</strong>
      </div>
      <div class="budget-item">
        <span>Yearly Total:</span>
        <strong>$${yearlyTotal.toFixed(2)}</strong>
      </div>
      <div class="budget-item total">
        <span>Total Monthly Cost:</span>
        <strong>$${(monthlyTotal + (yearlyTotal / 12)).toFixed(2)}</strong>
      </div>
    </div>
  `

  // Use the existing subscription modal to show budget info
  const modal = document.getElementById("subscriptionModal")
  const modalTitle = document.getElementById("modalSubTitle")
  const modalDetails = document.getElementById("modalSubDetails")

  modalTitle.textContent = "Budget Overview"
  modalDetails.innerHTML = budgetInfo

  modal.classList.add("active")
}

// Enhanced Calendar generation with responsive design and click functionality
function buildCalendar() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() // 0-11
  const first = new Date(y, m, 1)
  const startDay = (first.getDay() + 6) % 7 // Monday-based index
  const daysInMonth = new Date(y, m + 1, 0).getDate()

  document.getElementById("calMonth").textContent = now.toLocaleString(undefined, { month: "long" })
  document.getElementById("calYear").textContent = y

  const grid = document.getElementById("calendarGrid")
  grid.innerHTML = ""

  // Calculate monthly total for calendar
  const monthlyTotal = subscriptions
    .filter(s => s.due?.type === "monthly")
    .reduce((sum, s) => sum + s.price, 0)
  document.getElementById("calTotal").textContent = `$${monthlyTotal.toFixed(2)}`

  // leading blanks
  for (let i = 0; i < startDay; i++) grid.appendChild(cell("", true))
  for (let d = 1; d <= daysInMonth; d++) {
    const due = subscriptions.find((s) => s.due && s.due.day === d)
    grid.appendChild(cell(d, false, due))
  }
}

function cell(day, dim = false, due = null) {
  const div = document.createElement("div")
  div.className = "cell" + (dim ? " dim" : "") + (due ? " glow" : "")
  div.textContent = day || ""

  if (due) {
    const badge = document.createElement("div")
    badge.className = "badge"
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--accent")
    badge.textContent = due.badge
    const colorMap = {
      spotify: "#1DB954",
      youtube: "#FF3D00",
      amazon: "#FF9900",
      dropbox: "#0EA5E9",
      adobe: "#FF5722",
      netflix: "#E50914",
    }
    badge.style.background = colorMap[due.class] || bg
    div.appendChild(badge)
  }

  // Add click event for calendar cells
  if (!dim && day) {
    div.addEventListener("click", () => showCalendarModal(day))
  }

  return div
}

// Calendar modal functionality
function showCalendarModal(day) {
  const modal = document.getElementById("calendarModal")
  const modalDate = document.getElementById("modalDate")
  const modalSubscriptions = document.getElementById("modalSubscriptions")

  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth(), day)
  const dateString = date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  modalDate.textContent = dateString

  // Find subscriptions due on this day
  const dueSubscriptions = subscriptions.filter(s => s.due && s.due.day === day)

  if (dueSubscriptions.length > 0) {
    modalSubscriptions.innerHTML = dueSubscriptions.map(sub => `
      <div class="modal-subscription-item">
        <div class="logo ${sub.class}">${sub.badge}</div>
        <div class="details">
          <div class="name">${sub.name}</div>
          <div class="type">${sub.due.type === "yearly" ? "Yearly" : "Monthly"} subscription</div>
        </div>
        <div class="price">$${sub.price.toFixed(2)}</div>
      </div>
    `).join("")
  } else {
    modalSubscriptions.innerHTML = `
      <div style="text-align: center; color: var(--muted); padding: 20px;">
        No subscriptions due on this date
      </div>
    `
  }

  modal.classList.add("active")
}

// Close modal functionality
function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  modal.classList.remove("active")
}

// Wire modal close buttons
document.addEventListener("click", (e) => {
  if (e.target.closest(".modal-close")) {
    const modal = e.target.closest(".modal")
    if (modal) {
      modal.classList.remove("active")
    }
  }

  // Close modal when clicking outside
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("active")
  }
})

buildCalendar()

// Transactions
function rowItemTemplate(t) {
  const amount = t.amount >= 0 ? "$" + t.amount.toFixed(2) : "- $" + Math.abs(t.amount).toFixed(2)
  return `
    <li class="item">
      <div class="left">
        <div class="logo ${t.brandClass}">${t.icon}</div>
        <div class="meta">
          <div class="service">${t.name}</div>
          <div class="muted small">${t.time}${t.year ? ", " + t.year : ""}${t.renew ? " • Renews: " + t.renew : ""}</div>
        </div>
      </div>
      <div class="price">${amount}</div>
    </li>
  `
}
function renderTransactions() {
  document.getElementById("listTxAll").innerHTML = txAll.map(rowItemTemplate).join("")
  document.getElementById("listTxUpcoming").innerHTML = txUpcoming.map(rowItemTemplate).join("")
}
renderTransactions()

// Enhanced Notifications with click functionality
function notifItemTemplate(n) {
  return `
    <li class="item" data-notification-id="${n.id}">
      <div class="left">
        <div class="logo" style="background:#3a3a49;color:#fff">${n.icon}</div>
        <div class="meta">
          <div class="service">${n.title}</div>
          <div class="muted small">${n.text}</div>
        </div>
      </div>
      ${n.unread ? '<span class="dot" style="width:10px;height:10px;border-radius:999px;background:var(--accent)"></span>' : ""}
    </li>
  `
}

function renderNotifications() {
  const all = document.getElementById("listNotifAll")
  const unread = document.getElementById("listNotifUnread")
  all.innerHTML = notifications.map(notifItemTemplate).join("")
  unread.innerHTML = notifications
    .filter((n) => n.unread)
    .map(notifItemTemplate)
    .join("")

  // Add click handlers for notifications
  addNotificationClickHandlers()
}

function addNotificationClickHandlers() {
  document.querySelectorAll('[data-notification-id]').forEach(item => {
    item.addEventListener('click', () => {
      const notificationId = parseInt(item.getAttribute('data-notification-id'))
      const notification = notifications.find(n => n.id === notificationId)
      if (notification) {
        showNotificationModal(notification)
        // Mark as read
        notification.unread = false
        renderNotifications()
      }
    })
  })
}

function showNotificationModal(notification) {
  const modal = document.getElementById("notificationModal")
  const modalTitle = document.getElementById("modalNotifTitle")
  const modalContent = document.getElementById("modalNotifContent")

  modalTitle.textContent = notification.title
  modalContent.innerHTML = `
    <div style="margin-bottom: 16px;">
      <div style="font-size: 48px; text-align: center; margin-bottom: 16px;">${notification.icon}</div>
      <div style="font-size: 16px; line-height: 1.6; color: var(--text);">${notification.text}</div>
    </div>
    <div style="padding: 12px; background: #24242c; border-radius: 8px; border: 1px solid #343442;">
      <div style="font-size: 12px; color: var(--muted); margin-bottom: 4px;">Notification Type</div>
      <div style="font-weight: 600; text-transform: capitalize;">${notification.type.replace('_', ' ')}</div>
    </div>
  `

  modal.classList.add("active")
}

renderNotifications()

// Add Subscription form
document.getElementById("searchInput")?.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase()
  document.querySelectorAll(".brand-tile").forEach((b) => {
    const name = (b.dataset.name || "").toLowerCase()
    b.style.display = name.includes(q) ? "grid" : "none"
  })
})
document.querySelectorAll(".brand-tile").forEach((tile) => {
  tile.addEventListener("click", () => {
    document.getElementById("subName").value = tile.dataset.name || ""
  })
})
document.getElementById("addForm")?.addEventListener("submit", (e) => {
  e.preventDefault()
  const name = document.getElementById("subName").value.trim()
  if (!name) return
  const cycle = document.getElementById("cycle").value
  const newSub = {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    price: 9.99,
    badge: name.slice(0, 2).toUpperCase(),
    class: "dropbox",
    due: { day: 10, type: cycle },
  }
  subscriptions.push(newSub)
  renderSubs()
  buildCalendar()
  showScreen("screen-subscriptions")
})

// Responsive calendar adjustments
function adjustCalendarForScreenSize() {
  const isSmallScreen = window.innerWidth <= 480
  const isVerySmallScreen = window.innerWidth <= 360

  const calendarGrid = document.getElementById("calendarGrid")
  const weekdays = document.querySelector(".weekdays")

  if (calendarGrid && weekdays) {
    if (isVerySmallScreen) {
      calendarGrid.style.gap = "2px"
      weekdays.style.gap = "2px"
    } else if (isSmallScreen) {
      calendarGrid.style.gap = "3px"
      weekdays.style.gap = "3px"
    } else {
      calendarGrid.style.gap = "4px"
      weekdays.style.gap = "4px"
    }
  }
}

// Initialize responsive adjustments
window.addEventListener("resize", adjustCalendarForScreenSize)
adjustCalendarForScreenSize()

// Splash screen functionality
function showSplashScreen() {
  showScreen("screen-splash")
  setTimeout(() => {
    checkAuthStatus()
    if (isLoggedIn) {
      showScreen("screen-dashboard")
      updateProfileInfo()
    } else {
      showScreen("screen-onboarding")
    }
  }, 2000) // 2 seconds delay
}

// Start app with splash screen
showSplashScreen()
