// German Repetition Training - Homepage Interactive Scripts

// Intersection Observer for scroll-triggered animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active')
      // Optional: stop observing after animation triggers
      observer.unobserve(entry.target)
    }
  })
}, observerOptions)

// Observe all elements with reveal classes
document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
  revealElements.forEach(el => observer.observe(el))

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href')
      if (href !== '#' && href.length > 1) {
        e.preventDefault()
        const target = document.querySelector(href)
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      }
    })
  })

  // Add parallax effect to hero logo
  const heroLogo = document.querySelector('.hero-section img')
  if (heroLogo) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset
      const rate = scrolled * 0.3
      heroLogo.style.transform = `translateY(${rate}px)`
    })
  }

  // Counter animation for stats
  const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-number')
    counters.forEach(counter => {
      const text = counter.textContent

      // Only animate numeric values
      if (text.match(/^\d+%?$/)) {
        const target = parseInt(text)
        const duration = 2000
        const increment = target / (duration / 16)
        let current = 0

        const updateCounter = () => {
          current += increment
          if (current < target) {
            counter.textContent = Math.floor(current) + (text.includes('%') ? '%' : '')
            requestAnimationFrame(updateCounter)
          } else {
            counter.textContent = text
          }
        }

        updateCounter()
      }
    })
  }

  // Trigger counter animation when stats section is visible
  const statsSection = document.querySelector('.stats-section')
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters()
          statsObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.5 })

    statsObserver.observe(statsSection)
  }

  // Add floating animation to CTA buttons
  const ctaButtons = document.querySelectorAll('.btn-primary-custom, .btn-outline-custom')
  ctaButtons.forEach((btn, index) => {
    btn.style.animationDelay = `${index * 0.1}s`
  })
})

// Add particle effect on mousemove for hero section
const heroSection = document.querySelector('.hero-section')
if (heroSection && window.innerWidth > 768) {
  let particles = []
  const maxParticles = 15

  heroSection.addEventListener('mousemove', (e) => {
    if (particles.length < maxParticles && Math.random() > 0.9) {
      const particle = document.createElement('div')
      particle.style.position = 'absolute'
      particle.style.width = '4px'
      particle.style.height = '4px'
      particle.style.background = 'rgba(255, 255, 255, 0.6)'
      particle.style.borderRadius = '50%'
      particle.style.left = e.clientX + 'px'
      particle.style.top = e.clientY + 'px'
      particle.style.pointerEvents = 'none'
      particle.style.zIndex = '2'
      particle.style.transition = 'all 1s ease-out'

      heroSection.appendChild(particle)
      particles.push(particle)

      setTimeout(() => {
        particle.style.opacity = '0'
        particle.style.transform = `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(2)`
      }, 50)

      setTimeout(() => {
        particle.remove()
        particles = particles.filter(p => p !== particle)
      }, 1000)
    }
  })
}
