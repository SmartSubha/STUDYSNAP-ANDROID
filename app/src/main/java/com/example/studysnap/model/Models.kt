package com.example.studysnap.model

enum class NoteType(val displayName: String) {
    TEXT("Text"),
    PDF("PDF"),
    IMAGE("Image"),
    HTML("HTML"),
    VOICE("Voice"),
    VIDEO("Video")
}

data class Note(
    val id: String,
    val title: String,
    val subject: String,
    val type: NoteType,
    val content: String = "",
    val pdfUrl: String? = null,
    val authorId: String = "admin",
    val authorName: String = "Subhajit Sanpui",
    val createdAt: String = "Today",
    val aiSummary: String = "",
    val estimatedReadTime: String = "5 min",
    val isApproved: Boolean = true,
    val isBookmarked: Boolean = false,
    val isRead: Boolean = false
)

data class Quiz(
    val id: String,
    val question: String,
    val options: List<String>,
    val correctAnswer: Int,
    val subject: String,
    val points: Int = 20,
    val explanation: String = ""
)

data class UserProfile(
    val uid: String = "student_user_1",
    val name: String = "Subhajit Sanpui",
    val email: String = "smartsubha.developer@gmail.com",
    val classNum: Int = 12,
    val school: String = "Don Bosco High School",
    val phone: String = "9876543210",
    val points: Int = 1450,
    val streak: Int = 14,
    val isVIP: Boolean = true,
    val role: String = "admin" // admin, student, teacher
)

data class Notice(
    val id: String,
    val subject: String,
    val fromDate: String,
    val toDate: String,
    val priority: String, // high, medium, low
    val content: String,
    val type: String = "text"
)

data class LeaderboardEntry(
    val userId: String,
    val name: String,
    val points: Int,
    val isVIP: Boolean,
    val rank: Int,
    val school: String
)

data class Question(
    val id: String,
    val userId: String,
    val userName: String,
    val text: String,
    val answer: String? = null,
    val createdAt: String,
    val status: String = "answered" // pending, answered
)

data class CalendarEvent(
    val id: String,
    val title: String,
    val date: String,
    val type: String, // exam, holiday, class, other
    val description: String = ""
)

data class LofiTrack(
    val id: String,
    val title: String,
    val artist: String,
    val duration: String
)
