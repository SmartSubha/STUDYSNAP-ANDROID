package com.example.studysnap.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.studysnap.data.StudySnapRepository
import com.example.studysnap.model.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class StudySnapViewModel(
    private val repository: StudySnapRepository = StudySnapRepository()
) : ViewModel() {

    val userProfile: StateFlow<UserProfile> = repository.userProfile
    val notes: StateFlow<List<Note>> = repository.notes
    val quizzes: StateFlow<List<Quiz>> = repository.quizzes
    val leaderboard: StateFlow<List<LeaderboardEntry>> = repository.leaderboard
    val notices: StateFlow<List<Notice>> = repository.notices
    val questions: StateFlow<List<Question>> = repository.questions
    val calendarEvents: StateFlow<List<CalendarEvent>> = repository.calendarEvents
    val lofiTracks: StateFlow<List<LofiTrack>> = repository.lofiTracks

    private val _selectedTab = MutableStateFlow("home")
    val selectedTab: StateFlow<String> = _selectedTab.asStateFlow()

    private val _selectedSubject = MutableStateFlow("All")
    val selectedSubject: StateFlow<String> = _selectedSubject.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _readingNote = MutableStateFlow<Note?>(null)
    val readingNote: StateFlow<Note?> = _readingNote.asStateFlow()

    private val _currentTrackIndex = MutableStateFlow(0)
    val currentTrackIndex: StateFlow<Int> = _currentTrackIndex.asStateFlow()

    private val _isMusicPlaying = MutableStateFlow(false)
    val isMusicPlaying: StateFlow<Boolean> = _isMusicPlaying.asStateFlow()

    private val _selectedAnswers = MutableStateFlow<Map<String, Int>>(emptyMap())
    val selectedAnswers: StateFlow<Map<String, Int>> = _selectedAnswers.asStateFlow()

    private val _quizResults = MutableStateFlow<Map<String, Boolean>>(emptyMap())
    val quizResults: StateFlow<Map<String, Boolean>> = _quizResults.asStateFlow()

    private val _toastMessage = MutableSharedFlow<String>()
    val toastMessage = _toastMessage.asSharedFlow()

    private val _isSolvingAI = MutableStateFlow(false)
    val isSolvingAI: StateFlow<Boolean> = _isSolvingAI.asStateFlow()

    val filteredNotes: StateFlow<List<Note>> = combine(notes, selectedSubject, searchQuery) { list, subject, query ->
        list.filter { note ->
            val matchesSubject = (subject == "All" || note.subject.equals(subject, ignoreCase = true))
            val matchesQuery = query.isBlank() || 
                note.title.contains(query, ignoreCase = true) || 
                note.content.contains(query, ignoreCase = true) ||
                note.subject.contains(query, ignoreCase = true)
            matchesSubject && matchesQuery
        }
    }.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    val subjects = listOf("All", "Biology", "Physics", "Chemistry", "Mathematics", "Computer Science", "English")

    fun selectTab(tab: String) {
        _selectedTab.value = tab
    }

    fun selectSubject(subject: String) {
        _selectedSubject.value = subject
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun openNote(note: Note) {
        _readingNote.value = note
        repository.markNoteAsRead(note.id)
    }

    fun closeNote() {
        _readingNote.value = null
    }

    fun toggleBookmark(noteId: String) {
        repository.toggleBookmark(noteId)
        viewModelScope.launch {
            _toastMessage.emit("Bookmark updated")
        }
    }

    fun selectQuizOption(quizId: String, optionIndex: Int) {
        _selectedAnswers.value = _selectedAnswers.value + (quizId to optionIndex)
    }

    fun submitQuiz(quizId: String) {
        val selected = _selectedAnswers.value[quizId] ?: return
        val isCorrect = repository.answerQuiz(quizId, selected)
        _quizResults.value = _quizResults.value + (quizId to isCorrect)
        viewModelScope.launch {
            if (isCorrect) {
                _toastMessage.emit("🎉 Correct Answer! +20 Points added!")
            } else {
                _toastMessage.emit("❌ Incorrect. Check the explanation below.")
            }
        }
    }

    fun submitDoubt(questionText: String, userName: String) {
        if (questionText.isBlank()) return
        viewModelScope.launch {
            _isSolvingAI.value = true
            delay(800) // Realistic AI synthesis feedback
            repository.submitDoubt(questionText, userName)
            _isSolvingAI.value = false
            _toastMessage.emit("💡 AI Doubt Solver answered your question! (+5 Points)")
        }
    }

    fun toggleMusic() {
        _isMusicPlaying.value = !_isMusicPlaying.value
    }

    fun nextTrack() {
        val total = lofiTracks.value.size
        if (total > 0) {
            _currentTrackIndex.value = (_currentTrackIndex.value + 1) % total
        }
    }

    fun addNote(title: String, subject: String, type: NoteType, content: String, authorName: String) {
        repository.addNote(title, subject, type, content, authorName)
        viewModelScope.launch {
            _toastMessage.emit("✅ New Study Note published! (+25 Points)")
        }
    }

    fun addNotice(subject: String, priority: String, content: String) {
        repository.addNotice(subject, priority, content)
        viewModelScope.launch {
            _toastMessage.emit("📢 Notice published successfully")
        }
    }

    fun addQuiz(question: String, options: List<String>, correctAnswer: Int, subject: String, explanation: String) {
        repository.addQuiz(question, options, correctAnswer, subject, explanation)
        viewModelScope.launch {
            _toastMessage.emit("📝 New Quiz question created!")
        }
    }

    fun updateProfile(name: String, school: String, phone: String, classNum: Int) {
        repository.updateProfile(name, school, phone, classNum)
        viewModelScope.launch {
            _toastMessage.emit("Profile details updated successfully")
        }
    }

    fun toggleVIP() {
        repository.toggleVIP()
        viewModelScope.launch {
            val status = if (userProfile.value.isVIP) "Activated" else "Deactivated"
            _toastMessage.emit("VIP Status $status")
        }
    }
}
