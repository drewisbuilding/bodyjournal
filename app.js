// Body Journal - Application Logic with Personalization

class App {
  constructor() {
    this.state = {
      currentDay: 1,
      startDate: null,
      intensity: 'light',
      view: 'today',
      viewDay: 1,
      log: null,
      profile: null,
      showOnboarding: false,
      showSettings: false,
      showEditProfile: false
    };

    this.loadProfile();
    if (!this.state.profile) {
      this.state.showOnboarding = true;
    } else {
      this.loadMeta();
      this.loadLog();
    }
    this.init();
  }

  loadProfile() {
    const profile = localStorage.getItem('bj_profile');
    if (profile) {
      this.state.profile = JSON.parse(profile);
    }
  }

  saveProfile(profile) {
    this.state.profile = profile;
    localStorage.setItem('bj_profile', JSON.stringify(profile));
  }

  calcCurrentDay(startDate) {
    if (!startDate) return 1;
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - start) / 86400000);
    return Math.max(1, Math.min(90, diff + 1));
  }

  completeOnboarding(fitnessLevel, equipment, goal) {
    const profile = { fitnessLevel, equipment, goal };
    this.saveProfile(profile);
    this.state.showOnboarding = false;
    if (!this.state.startDate) {
      this.state.startDate = new Date().toISOString().split('T')[0];
      this.state.currentDay = 1;
      this.state.viewDay = 1;
    }
    this.saveMeta();
    this.loadLog();
    this.render();
  }

  loadMeta() {
    const meta = localStorage.getItem('bj_meta');
    if (meta) {
      const parsed = JSON.parse(meta);
      this.state.intensity = parsed.intensity || 'light';

      if (parsed.startDate) {
        this.state.startDate = parsed.startDate;
        this.state.currentDay = this.calcCurrentDay(parsed.startDate);
      } else if (parsed.currentDay) {
        // migrate: backfill startDate from saved currentDay
        const start = new Date();
        start.setDate(start.getDate() - (parsed.currentDay - 1));
        this.state.startDate = start.toISOString().split('T')[0];
        this.state.currentDay = parsed.currentDay;
        this.saveMeta();
      } else {
        this.state.currentDay = 1;
      }

      this.state.viewDay = this.state.currentDay;
    }
  }

  saveMeta() {
    localStorage.setItem('bj_meta', JSON.stringify({
      startDate: this.state.startDate,
      intensity: this.state.intensity
    }));
  }

  loadLog() {
    const key = `bj_day_${this.state.viewDay}_${this.state.intensity}`;
    const log = localStorage.getItem(key);
    if (log) {
      this.state.log = JSON.parse(log);
    } else {
      this.state.log = this.generateLog();
    }
  }

  generateLog() {
    const dayInfo = getDayInfo(this.state.viewDay);
    if (!dayInfo) return null;

    if (dayInfo.isRest) {
      return { completed: false, intensity: this.state.intensity, exercises: [] };
    }

    const exercises = getPersonalizedExercises(dayInfo.workoutType, this.state.intensity, this.state.profile);
    return {
      completed: false,
      intensity: this.state.intensity,
      exercises: exercises || []
    };
  }

  saveLog() {
    if (!this.state.log) return;
    const key = `bj_day_${this.state.viewDay}_${this.state.intensity}`;
    localStorage.setItem(key, JSON.stringify(this.state.log));
  }

  setView(view) {
    this.state.view = view;
    if (view === 'today') {
      this.state.viewDay = this.state.currentDay;
      this.loadLog();
    }
    this.render();
  }

  setIntensity(intensity) {
    const otherKey = `bj_day_${this.state.viewDay}_${intensity}`;
    const existingLog = localStorage.getItem(otherKey);
    this.state.intensity = intensity;
    if (existingLog) {
      this.state.log = JSON.parse(existingLog);
    } else {
      this.state.log = this.generateLog();
    }
    if (this.state.view === 'today') this.saveMeta();
    this.render();
  }

  setViewDay(day) {
    this.state.viewDay = day;
    this.loadLog();
    this.state.view = 'today';
    this.render();
  }

  jumpToToday() {
    this.state.viewDay = this.state.currentDay;
    this.state.view = 'today';
    this.loadLog();
    this.render();
  }

  openSettings() {
    this.state.showSettings = true;
    this.render();
  }

  closeSettings() {
    this.state.showSettings = false;
    this.state.showEditProfile = false;
    this.render();
  }

  updateProfile(fitnessLevel, equipment, goal) {
    const profile = { fitnessLevel, equipment, goal };
    this.saveProfile(profile);
    this.loadLog();
    this.closeSettings();
  }

  resetProgress() {
    if (confirm('Delete all progress and start over? This cannot be undone.')) {
      localStorage.clear();
      location.reload();
    }
  }

  saveProgress() {
    this.saveLog();
    this.showStatus('Saved');
  }

  completeDay() {
    if (!this.state.log) return;
    this.state.log.completed = true;
    this.saveLog();
    this.showStatus('Day Complete!');
    this.render();
  }

  updateSet(exerciseIndex, setIndex, field, value) {
    if (this.state.log && this.state.log.exercises[exerciseIndex]) {
      if (field === 'done') {
        this.state.log.exercises[exerciseIndex].sets[setIndex].done =
          !this.state.log.exercises[exerciseIndex].sets[setIndex].done;
      } else {
        this.state.log.exercises[exerciseIndex].sets[setIndex][field] = value;
      }
    }
  }

  showStatus(message) {
    const statusEl = document.createElement('div');
    statusEl.className = 'status-message';
    statusEl.textContent = message;
    document.body.appendChild(statusEl);
    setTimeout(() => { statusEl.remove(); }, 1500);
  }

  getDateForDay(dayNum) {
    if (!this.state.startDate) return null;
    const date = new Date(this.state.startDate);
    date.setDate(date.getDate() + dayNum - 1);
    return date;
  }

  formatDateLong(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  formatDateShort(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  renderTodayView() {
    const dayInfo = getDayInfo(this.state.viewDay);
    if (!dayInfo) return '';

    const date = this.getDateForDay(this.state.viewDay);
    const dateStr = date ? this.formatDateLong(date) : '';

    return `
      <div class="today-view">
        <div class="day-hero">
          <div class="day-hero-header">
            <div class="day-number">${dayInfo.day}</div>
            <div>
              <div class="day-label">${WORKOUT_META[dayInfo.workoutType].label}</div>
              <div class="day-phase">${dayInfo.phaseName} Phase · Week ${dayInfo.weekNumber}</div>
              ${dateStr ? `<div class="day-actual-date">${dateStr}</div>` : ''}
            </div>
          </div>
          <div class="day-subtitle">${WORKOUT_META[dayInfo.workoutType].subtitle}</div>
        </div>

        <div class="content">
          ${dayInfo.isRest ? this.renderRestDay() : `
            ${this.renderWarmup(dayInfo.workoutType)}
            ${this.renderExercises()}
            ${this.renderCooldown(dayInfo.workoutType)}
          `}
        </div>

        ${this.state.viewDay !== this.state.currentDay
          ? `<div class="jump-today" data-action="jump-today">Jump to Today (Day ${this.state.currentDay})</div>`
          : ''}

        <div class="actions">
          ${dayInfo.isRest
            ? `<button class="btn primary ${this.state.intensity}" data-action="complete-day">Mark Complete</button>`
            : `<button class="btn" data-action="save-progress">Save Progress</button>
               <button class="btn primary ${this.state.intensity}" data-action="complete-day">Complete Day</button>`
          }
        </div>
      </div>
    `;
  }

  renderWarmup(workoutType) {
    if (typeof WARMUP === 'undefined') return '';
    const warmup = WARMUP[workoutType];
    if (!warmup) return '';
    return `
      <div class="phase-section warmup-section">
        <div class="phase-header" data-action="toggle-section" data-section="warmup">
          <div class="phase-title">Warm-Up</div>
          <div class="phase-duration">~5-8 min</div>
          <span class="phase-toggle">▾</span>
        </div>
        <div class="phase-content" id="warmup-content">
          ${warmup.map(item => `
            <div class="stretch-row">
              <div class="stretch-name">${item.name}</div>
              <div class="stretch-detail">
                <span class="stretch-duration">${item.duration}</span>
                <span class="stretch-notes">${item.notes}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderCooldown(workoutType) {
    if (typeof COOLDOWN === 'undefined') return '';
    const cooldown = COOLDOWN[workoutType];
    if (!cooldown) return '';
    return `
      <div class="phase-section cooldown-section">
        <div class="phase-header" data-action="toggle-section" data-section="cooldown">
          <div class="phase-title">Cool-Down & Stretch</div>
          <div class="phase-duration">~5-10 min</div>
          <span class="phase-toggle">▾</span>
        </div>
        <div class="phase-content" id="cooldown-content">
          ${cooldown.map(item => `
            <div class="stretch-row">
              <div class="stretch-name">${item.name}</div>
              <div class="stretch-detail">
                <span class="stretch-duration">${item.duration}</span>
                <span class="stretch-notes">${item.notes}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderOnboarding() {
    return `
      <div class="modal-overlay">
        <div class="modal onboarding-modal">
          <div class="modal-header">
            <h2>Welcome to Body Journal</h2>
            <p>Let's personalize your program</p>
          </div>

          <form id="onboarding-form" class="onboarding-form">
            <div class="form-group">
              <label>Fitness Level</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="fitness" value="beginner" checked>
                  <span>Beginner</span>
                  <div class="radio-desc">New to training or returning after a break</div>
                </label>
                <label class="radio-label">
                  <input type="radio" name="fitness" value="intermediate">
                  <span>Intermediate</span>
                  <div class="radio-desc">Training consistently 1-2 years</div>
                </label>
                <label class="radio-label">
                  <input type="radio" name="fitness" value="advanced">
                  <span>Advanced</span>
                  <div class="radio-desc">2+ years of consistent training</div>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Available Equipment</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" name="equipment" value="barbell">
                  <span>Barbell</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="equipment" value="dumbbells">
                  <span>Dumbbells</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="equipment" value="pull_up_bar">
                  <span>Pull-up Bar</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="equipment" value="cable_machine">
                  <span>Cable / Machines</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="equipment" value="bench">
                  <span>Weight Bench</span>
                </label>
              </div>
              <p class="form-hint">Select all that apply. Leave empty for bodyweight-only exercises.</p>
            </div>

            <div class="form-group">
              <label>Goal</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="goal" value="build" checked>
                  <span>Build Muscle</span>
                  <div class="radio-desc">Progressive strength & hypertrophy</div>
                </label>
                <label class="radio-label">
                  <input type="radio" name="goal" value="cut">
                  <span>Get Fit / Cut</span>
                  <div class="radio-desc">Maintain strength while leaning out</div>
                </label>
                <label class="radio-label">
                  <input type="radio" name="goal" value="endurance">
                  <span>Build Endurance</span>
                  <div class="radio-desc">Aerobic capacity & conditioning</div>
                </label>
              </div>
            </div>

            <button type="submit" class="btn primary" style="width: 100%; margin-top: 16px;">Start Program</button>
          </form>
        </div>
      </div>
    `;
  }

  renderSettingsModal() {
    if (!this.state.profile) return '';

    const tierDesc = DIFFICULTY_TIERS[this.state.profile.fitnessLevel];
    const goalMsg = getGoalMessage(this.state.profile.goal);
    const startDateStr = this.state.startDate
      ? new Date(this.state.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'Not set';

    return `
      <div class="modal-overlay" data-action="close-settings">
        <div class="modal settings-modal" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h2>Profile Settings</h2>
            <button class="modal-close" data-action="close-settings">✕</button>
          </div>

          <div class="settings-content">
            <div class="setting-section">
              <h3>Current Profile</h3>
              <div class="profile-summary">
                <div class="profile-item">
                  <div class="profile-label">Fitness Level</div>
                  <div class="profile-value">${tierDesc ? tierDesc.name : 'Unknown'}</div>
                  <div class="profile-desc">${tierDesc ? tierDesc.description : ''}</div>
                </div>
                <div class="profile-item">
                  <div class="profile-label">Equipment</div>
                  <div class="profile-value">${this.state.profile.equipment.length > 0 ? this.state.profile.equipment.join(', ') : 'Bodyweight'}</div>
                </div>
                <div class="profile-item">
                  <div class="profile-label">Goal</div>
                  <div class="profile-value">${this.state.profile.goal.charAt(0).toUpperCase() + this.state.profile.goal.slice(1)}</div>
                  <div class="profile-desc">${goalMsg}</div>
                </div>
              </div>
            </div>

            <div class="setting-section">
              <h3>Progress</h3>
              <div class="progress-info">
                <div>Started: <strong>${startDateStr}</strong></div>
                <div>Current Day: <strong>${this.state.currentDay} / 90</strong></div>
                <div>${Math.round((this.state.currentDay / 90) * 100)}% complete</div>
              </div>
            </div>

            <div class="setting-actions">
              <button class="btn secondary" data-action="edit-profile">Edit Profile</button>
              <button class="btn danger" data-action="reset-progress">Reset Progress</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderEditProfileModal() {
    return `
      <div class="modal-overlay">
        <div class="modal edit-profile-modal">
          <div class="modal-header">
            <h2>Edit Profile</h2>
          </div>

          <form id="edit-profile-form" class="onboarding-form">
            <div class="form-group">
              <label>Fitness Level</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="fitness" value="beginner" ${this.state.profile.fitnessLevel === 'beginner' ? 'checked' : ''}>
                  <span>Beginner</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="fitness" value="intermediate" ${this.state.profile.fitnessLevel === 'intermediate' ? 'checked' : ''}>
                  <span>Intermediate</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="fitness" value="advanced" ${this.state.profile.fitnessLevel === 'advanced' ? 'checked' : ''}>
                  <span>Advanced</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Available Equipment</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" name="equipment" value="barbell" ${this.state.profile.equipment.includes('barbell') ? 'checked' : ''}>
                  <span>Barbell</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="equipment" value="dumbbells" ${this.state.profile.equipment.includes('dumbbells') ? 'checked' : ''}>
                  <span>Dumbbells</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="equipment" value="pull_up_bar" ${this.state.profile.equipment.includes('pull_up_bar') ? 'checked' : ''}>
                  <span>Pull-up Bar</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="equipment" value="cable_machine" ${this.state.profile.equipment.includes('cable_machine') ? 'checked' : ''}>
                  <span>Cable / Machines</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="equipment" value="bench" ${this.state.profile.equipment.includes('bench') ? 'checked' : ''}>
                  <span>Weight Bench</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Goal</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="goal" value="build" ${this.state.profile.goal === 'build' ? 'checked' : ''}>
                  <span>Build Muscle</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="goal" value="cut" ${this.state.profile.goal === 'cut' ? 'checked' : ''}>
                  <span>Get Fit / Cut</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="goal" value="endurance" ${this.state.profile.goal === 'endurance' ? 'checked' : ''}>
                  <span>Build Endurance</span>
                </label>
              </div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 16px;">
              <button type="submit" class="btn primary" style="flex: 1;">Save Changes</button>
              <button type="button" class="btn secondary" data-action="close-settings" style="flex: 1;">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderRestDay() {
    return `
      <div class="rest-day">
        <div class="rest-day-label">REST</div>
        <div class="rest-day-message">Take the day to recover. Eat well, sleep well, prepare for tomorrow.</div>
      </div>
    `;
  }

  renderExercises() {
    if (!this.state.log || !this.state.log.exercises) return '';

    return `
      <div class="exercises-list">
        ${this.state.log.exercises.map((exercise, exIdx) => `
          <div class="exercise-card">
            <div class="exercise-header">
              <div class="exercise-name">${exercise.name}</div>
              <div class="exercise-target">
                ${exercise.target.sets}×${exercise.target.reps}
                ${exercise.target.rest ? ` · ${exercise.target.rest}s rest` : ''}
              </div>
            </div>
            <div class="sets-grid">
              ${exercise.sets.map((set, setIdx) => `
                <div class="set-row">
                  <div class="set-number">S${setIdx + 1}</div>
                  <input
                    type="text"
                    inputmode="decimal"
                    class="set-input"
                    placeholder="lbs"
                    value="${set.weight}"
                    data-action="update-set"
                    data-exercise="${exIdx}"
                    data-set="${setIdx}"
                    data-field="weight"
                  >
                  <input
                    type="text"
                    inputmode="numeric"
                    class="set-input"
                    placeholder="reps"
                    value="${set.reps}"
                    data-action="update-set"
                    data-exercise="${exIdx}"
                    data-set="${setIdx}"
                    data-field="reps"
                  >
                  <button
                    class="set-checkbox ${set.done ? 'done' : ''}"
                    data-action="toggle-set"
                    data-exercise="${exIdx}"
                    data-set="${setIdx}"
                  >${set.done ? '✓' : ''}</button>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderCalendarView() {
    const dayButtons = [];
    for (let day = 1; day <= 90; day++) {
      const dayInfo = getDayInfo(day);
      const key = `bj_day_${day}_${this.state.intensity}`;
      const log = localStorage.getItem(key);
      const isCompleted = log ? JSON.parse(log).completed : false;

      let cssClass = '';
      if (day === this.state.currentDay) cssClass = 'today';
      else if (day === this.state.viewDay) cssClass = 'active';
      else if (isCompleted) cssClass = 'completed';
      else if (dayInfo.isRest) cssClass = 'rest';

      const date = this.getDateForDay(day);
      const dateLabel = date ? this.formatDateShort(date) : '';

      dayButtons.push(`
        <button class="day-button ${cssClass}" data-action="set-view-day" data-day="${day}">
          <span class="day-btn-num">${day}</span>
          ${dateLabel ? `<span class="day-btn-date">${dateLabel}</span>` : ''}
        </button>
      `);
    }

    return `
      <div class="calendar-view">
        <div class="calendar-scroll">
          <div class="calendar-grid">
            ${dayButtons.join('')}
          </div>
        </div>
        <div class="calendar-legend">
          <div class="legend-item">
            <div class="legend-box" style="background-color:var(--green-dim);border:1px solid var(--green)"></div>
            <span>Today</span>
          </div>
          <div class="legend-item">
            <div class="legend-box" style="background-color:var(--orange-dim);border:1px solid var(--orange)"></div>
            <span>Viewing</span>
          </div>
          <div class="legend-item">
            <div class="legend-box" style="background-color:var(--green-dim);opacity:.7;border:1px solid var(--green)"></div>
            <span>Completed</span>
          </div>
          <div class="legend-item">
            <div class="legend-box" style="background-color:var(--bg);border:1px solid var(--border)"></div>
            <span>Rest Day</span>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const app = document.getElementById('app');

    if (this.state.showOnboarding) {
      app.innerHTML = this.renderOnboarding();
      this.attachOnboardingListener();
      return;
    }

    if (this.state.showSettings) {
      app.innerHTML = this.renderSettingsModal();
      this.attachSettingsListeners();
      return;
    }

    if (this.state.showEditProfile) {
      app.innerHTML = this.renderEditProfileModal();
      this.attachEditProfileListener();
      return;
    }

    app.innerHTML = `
      <div class="top-bar">
        <div class="tab-switcher">
          <button class="tab-btn ${this.state.view === 'today' ? 'active' : ''}" data-action="set-view" data-view="today">Today</button>
          <button class="tab-btn ${this.state.view === 'calendar' ? 'active' : ''}" data-action="set-view" data-view="calendar">Calendar</button>
        </div>
        <div class="top-bar-right">
          <div class="intensity-toggle">
            <button class="intensity-btn light ${this.state.intensity === 'light' ? 'active' : ''}" data-action="set-intensity" data-intensity="light">Light</button>
            <button class="intensity-btn heavy ${this.state.intensity === 'heavy' ? 'active' : ''}" data-action="set-intensity" data-intensity="heavy">Heavy</button>
          </div>
          <button class="btn-settings" data-action="open-settings" title="Profile & Settings">⚙</button>
        </div>
      </div>
      <div class="view-container">
        ${this.state.view === 'today' ? this.renderTodayView() : this.renderCalendarView()}
      </div>
    `;

    this.attachEventListeners();
  }

  attachOnboardingListener() {
    const form = document.getElementById('onboarding-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      this.completeOnboarding(
        formData.get('fitness'),
        formData.getAll('equipment'),
        formData.get('goal')
      );
    });
  }

  attachSettingsListeners() {
    const app = document.getElementById('app');
    app.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'close-settings') {
        this.closeSettings();
      } else if (action === 'edit-profile') {
        this.state.showEditProfile = true;
        this.state.showSettings = false;
        this.render();
      } else if (action === 'reset-progress') {
        this.resetProgress();
      }
    });
  }

  attachEditProfileListener() {
    const form = document.getElementById('edit-profile-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      this.state.showEditProfile = false;
      this.updateProfile(
        formData.get('fitness'),
        formData.getAll('equipment'),
        formData.get('goal')
      );
      this.render();
    });

    const app = document.getElementById('app');
    app.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'close-settings') {
        this.state.showEditProfile = false;
        this.render();
      }
    });
  }

  attachEventListeners() {
    const app = document.getElementById('app');

    app.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;

      if (action === 'set-view') {
        this.setView(target.dataset.view);
      } else if (action === 'set-intensity') {
        this.setIntensity(target.dataset.intensity);
      } else if (action === 'set-view-day') {
        this.setViewDay(parseInt(target.dataset.day));
      } else if (action === 'jump-today') {
        this.jumpToToday();
      } else if (action === 'save-progress') {
        this.saveProgress();
      } else if (action === 'complete-day') {
        this.completeDay();
      } else if (action === 'toggle-set') {
        this.updateSet(parseInt(target.dataset.exercise), parseInt(target.dataset.set), 'done', null);
        this.render();
      } else if (action === 'open-settings') {
        this.openSettings();
      } else if (action === 'toggle-section') {
        const content = document.getElementById(`${target.dataset.section}-content`);
        const toggle = target.querySelector('.phase-toggle');
        if (content) {
          content.classList.toggle('collapsed');
          if (toggle) toggle.style.transform = content.classList.contains('collapsed') ? 'rotate(-90deg)' : '';
        }
      }
    });

    app.addEventListener('input', (e) => {
      if (e.target.dataset.action === 'update-set') {
        this.updateSet(
          parseInt(e.target.dataset.exercise),
          parseInt(e.target.dataset.set),
          e.target.dataset.field,
          e.target.value
        );
      }
    });
  }

  init() {
    this.render();
  }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });
if (document.readyState !== 'loading') { window.app = new App(); }
