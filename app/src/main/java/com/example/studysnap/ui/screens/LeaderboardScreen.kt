package com.example.studysnap.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studysnap.model.LeaderboardEntry
import com.example.studysnap.ui.theme.*
import com.example.studysnap.ui.viewmodel.StudySnapViewModel

@Composable
fun LeaderboardScreen(
    viewModel: StudySnapViewModel,
    modifier: Modifier = Modifier
) {
    val leaderboard by viewModel.leaderboard.collectAsState()
    val userProfile by viewModel.userProfile.collectAsState()

    val topThree = leaderboard.take(3)
    val remaining = leaderboard.drop(3)

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("leaderboard_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Student Leaderboard",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Black
            )
            Text(
                text = "Recognizing academic diligence, daily quiz streaks & note mastery",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Top 3 Podium
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("leaderboard_podium_card"),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "TOP SCHOLARS PODIUM",
                        style = MaterialTheme.typography.labelSmall,
                        color = BluePrimary,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.Bottom
                    ) {
                        // 2nd Place
                        if (topThree.size > 1) {
                            PodiumColumn(
                                entry = topThree[1],
                                rankColor = Color(0xFF94A3B8),
                                height = 110.dp,
                                crownIcon = Icons.Default.EmojiEvents
                            )
                        }

                        // 1st Place (Center, tallest)
                        if (topThree.isNotEmpty()) {
                            PodiumColumn(
                                entry = topThree[0],
                                rankColor = Color(0xFFF59E0B),
                                height = 140.dp,
                                crownIcon = Icons.Default.WorkspacePremium
                            )
                        }

                        // 3rd Place
                        if (topThree.size > 2) {
                            PodiumColumn(
                                entry = topThree[2],
                                rankColor = Color(0xFFD97706),
                                height = 90.dp,
                                crownIcon = Icons.Default.MilitaryTech
                            )
                        }
                    }
                }
            }
        }

        item {
            Text(
                text = "FULL RANKINGS",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        items(leaderboard) { entry ->
            val isCurrentUser = (entry.name == userProfile.name)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("leaderboard_row_${entry.rank}"),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isCurrentUser) BluePrimary.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surface
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(
                                when (entry.rank) {
                                    1 -> Color(0xFFFEF3C7)
                                    2 -> Color(0xFFF1F5F9)
                                    3 -> Color(0xFFFEE2E2)
                                    else -> MaterialTheme.colorScheme.surfaceVariant
                                }
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "#${entry.rank}",
                            fontWeight = FontWeight.Black,
                            fontSize = 12.sp,
                            color = when (entry.rank) {
                                1 -> Color(0xFFB45309)
                                2 -> Color(0xFF475569)
                                3 -> Color(0xFFB91C1C)
                                else -> MaterialTheme.colorScheme.onSurfaceVariant
                            }
                        )
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = entry.name,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            if (entry.isVIP) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = AmberWarning
                                ) {
                                    Text(
                                        text = "VIP",
                                        color = Navy900,
                                        fontSize = 8.sp,
                                        fontWeight = FontWeight.Black,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            if (isCurrentUser) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "(You)",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = BluePrimary
                                )
                            }
                        }
                        Text(
                            text = entry.school,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Text(
                        text = "${entry.points} pts",
                        fontWeight = FontWeight.Black,
                        fontSize = 14.sp,
                        color = BluePrimary
                    )
                }
            }
        }
    }
}

@Composable
fun PodiumColumn(
    entry: LeaderboardEntry,
    rankColor: Color,
    height: androidx.compose.ui.unit.Dp,
    crownIcon: androidx.compose.ui.graphics.vector.ImageVector
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(96.dp)
    ) {
        Icon(
            imageVector = crownIcon,
            contentDescription = "Rank ${entry.rank}",
            tint = rankColor,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = entry.name.split(" ").firstOrNull() ?: entry.name,
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
            textAlign = TextAlign.Center,
            maxLines = 1
        )
        Text(
            text = "${entry.points} pts",
            fontWeight = FontWeight.Black,
            fontSize = 11.sp,
            color = BluePrimary
        )
        Spacer(modifier = Modifier.height(6.dp))
        Box(
            modifier = Modifier
                .width(80.dp)
                .height(height)
                .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
                .background(rankColor.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "${entry.rank}",
                fontWeight = FontWeight.Black,
                fontSize = 28.sp,
                color = rankColor
            )
        }
    }
}
