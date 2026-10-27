package com.example.studysnap.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studysnap.ui.components.*
import com.example.studysnap.ui.theme.*
import com.example.studysnap.ui.viewmodel.StudySnapViewModel

@Composable
fun HomeScreen(
    viewModel: StudySnapViewModel,
    modifier: Modifier = Modifier
) {
    val userProfile by viewModel.userProfile.collectAsState()
    val notes by viewModel.filteredNotes.collectAsState()
    val quizzes by viewModel.quizzes.collectAsState()
    val selectedSubject by viewModel.selectedSubject.collectAsState()
    val lofiTracks by viewModel.lofiTracks.collectAsState()
    val currentTrackIndex by viewModel.currentTrackIndex.collectAsState()
    val isPlaying by viewModel.isMusicPlaying.collectAsState()

    val currentTrack = lofiTracks.getOrNull(currentTrackIndex) ?: lofiTracks.firstOrNull()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("home_screen"),
        contentPadding = PaddingValues(bottom = 80.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            TypewriterBanner()
        }

        // Student Welcome Hero Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .testTag("welcome_hero_card"),
                shape = RoundedCornerShape(24.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(
                                listOf(BluePrimary, Color(0xFF1E3A8A), Navy900)
                            )
                        )
                        .padding(20.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = Color.White.copy(alpha = 0.2f)
                            ) {
                                Text(
                                    text = "CLASS ${userProfile.classNum}",
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                            if (userProfile.isVIP) {
                                Surface(
                                    shape = RoundedCornerShape(10.dp),
                                    color = AmberWarning
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            Icons.Default.Star,
                                            contentDescription = "VIP",
                                            tint = Navy900,
                                            modifier = Modifier.size(12.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "VIP STUDENT",
                                            color = Navy900,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Black
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Text(
                            text = "Hello, ${userProfile.name}! 👋",
                            color = Color.White,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = "Ready to boost your knowledge today?",
                            color = Color.White.copy(alpha = 0.85f),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )

                        Spacer(modifier = Modifier.height(18.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Card(
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = Color.White.copy(alpha = 0.15f)
                                )
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text(
                                        text = "TOTAL POINTS",
                                        color = Color.White.copy(alpha = 0.7f),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                    Text(
                                        text = "${userProfile.points}",
                                        color = Color.White,
                                        fontSize = 22.sp,
                                        fontWeight = FontWeight.Black
                                    )
                                }
                            }

                            Card(
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = Color.White.copy(alpha = 0.15f)
                                )
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text(
                                        text = "DAILY STREAK",
                                        color = Color.White.copy(alpha = 0.7f),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                    Text(
                                        text = "${userProfile.streak} Days 🔥",
                                        color = Color.White,
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Black
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Mini Lofi Focus Music Player
        if (currentTrack != null) {
            item {
                Box(modifier = Modifier.padding(horizontal = 16.dp)) {
                    LofiMiniPlayer(
                        trackTitle = currentTrack.title,
                        artist = currentTrack.artist,
                        isPlaying = isPlaying,
                        onTogglePlay = { viewModel.toggleMusic() },
                        onNextTrack = { viewModel.nextTrack() }
                    )
                }
            }
        }

        // Quick Feature Shortcut Grid
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Text(
                    text = "QUICK STUDY HUBS",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    QuickActionCard(
                        title = "Notes",
                        subtitle = "Subject Vault",
                        icon = Icons.Default.MenuBook,
                        gradient = listOf(Color(0xFF3B82F6), Color(0xFF1D4ED8)),
                        onClick = { viewModel.selectTab("notes") },
                        modifier = Modifier.weight(1f)
                    )
                    QuickActionCard(
                        title = "Daily Quiz",
                        subtitle = "+20 Pts Each",
                        icon = Icons.Default.Psychology,
                        gradient = listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9)),
                        onClick = { viewModel.selectTab("quiz") },
                        modifier = Modifier.weight(1f)
                    )
                    QuickActionCard(
                        title = "AI Doubts",
                        subtitle = "Instant Solver",
                        icon = Icons.Default.AutoAwesome,
                        gradient = listOf(Color(0xFF10B981), Color(0xFF047857)),
                        onClick = { viewModel.selectTab("doubts") },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Subject Filter
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "EXPLORE NOTES",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "View All",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = BluePrimary,
                        modifier = Modifier.clickable { viewModel.selectTab("notes") }
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                SubjectFilterChips(
                    subjects = viewModel.subjects,
                    selectedSubject = selectedSubject,
                    onSelectSubject = { viewModel.selectSubject(it) }
                )
            }
        }

        // Notes List
        items(notes.take(4)) { note ->
            Box(modifier = Modifier.padding(horizontal = 16.dp)) {
                NoteCard(
                    note = note,
                    onOpen = { viewModel.openNote(note) },
                    onToggleBookmark = { viewModel.toggleBookmark(note.id) }
                )
            }
        }

        // Daily Quiz Preview
        if (quizzes.isNotEmpty()) {
            item {
                val dailyQuiz = quizzes.first()
                Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                    Text(
                        text = "TODAY'S QUIZ CHALLENGE",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { viewModel.selectTab("quiz") },
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                        )
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = dailyQuiz.subject.uppercase(),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    color = PurpleAccent
                                )
                                Text(
                                    text = "+20 POINTS",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    color = EmeraldSuccess
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = dailyQuiz.question,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Button(
                                onClick = { viewModel.selectTab("quiz") },
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Answer Quiz", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun QuickActionCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    gradient: List<Color>,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .clickable { onClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.linearGradient(gradient))
                .padding(12.dp)
        ) {
            Column {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = title,
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = subtitle,
                    color = Color.White.copy(alpha = 0.8f),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
