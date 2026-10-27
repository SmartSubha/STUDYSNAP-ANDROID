package com.example.studysnap.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studysnap.model.CalendarEvent
import com.example.studysnap.model.Notice
import com.example.studysnap.ui.theme.*
import com.example.studysnap.ui.viewmodel.StudySnapViewModel

@Composable
fun NoticesScreen(
    viewModel: StudySnapViewModel,
    modifier: Modifier = Modifier
) {
    val notices by viewModel.notices.collectAsState()
    val calendarEvents by viewModel.calendarEvents.collectAsState()

    var selectedSection by remember { mutableStateOf("notices") }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("notices_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Announcements & Calendar",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Black
            )
            Text(
                text = "Official administrative bulletins and academic schedules",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Section Tabs
        item {
            TabRow(
                selectedTabIndex = if (selectedSection == "notices") 0 else 1,
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                shape = RoundedCornerShape(14.dp)
            ) {
                Tab(
                    selected = selectedSection == "notices",
                    onClick = { selectedSection = "notices" },
                    text = { Text("Official Notices (${notices.size})", fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = selectedSection == "calendar",
                    onClick = { selectedSection = "calendar" },
                    text = { Text("Exam Calendar (${calendarEvents.size})", fontWeight = FontWeight.Bold) }
                )
            }
        }

        if (selectedSection == "notices") {
            items(notices) { notice ->
                NoticeItemCard(notice = notice)
            }
        } else {
            items(calendarEvents) { event ->
                CalendarEventCard(event = event)
            }
        }
    }
}

@Composable
fun NoticeItemCard(notice: Notice) {
    val priorityColor = when (notice.priority.lowercase()) {
        "high" -> RoseError
        "medium" -> AmberWarning
        else -> EmeraldSuccess
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("notice_card_${notice.id}"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = priorityColor.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = "${notice.priority.uppercase()} PRIORITY",
                        color = priorityColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.DateRange,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${notice.fromDate} - ${notice.toDate}",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = notice.subject,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Black
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = notice.content,
                style = MaterialTheme.typography.bodyMedium,
                lineHeight = 20.sp,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
fun CalendarEventCard(event: CalendarEvent) {
    val tagColor = when (event.type.lowercase()) {
        "exam" -> RoseError
        "holiday" -> PurpleAccent
        "class" -> BluePrimary
        else -> MaterialTheme.colorScheme.primary
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("calendar_event_card_${event.id}"),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = tagColor.copy(alpha = 0.15f),
                modifier = Modifier.size(54.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = event.date.takeLast(2),
                        fontWeight = FontWeight.Black,
                        fontSize = 18.sp,
                        color = tagColor
                    )
                    Text(
                        text = "NOV",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black,
                        color = tagColor
                    )
                }
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = tagColor.copy(alpha = 0.12f)
                ) {
                    Text(
                        text = event.type.uppercase(),
                        color = tagColor,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = event.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                if (event.description.isNotBlank()) {
                    Text(
                        text = event.description,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
