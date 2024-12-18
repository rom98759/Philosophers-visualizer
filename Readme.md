# Philosophers Visualizer

This project allows you to visualize the actions of philosophers in the dining philosophers problem in the form of a Gantt chart. The actions (eating, thinking, sleeping) are extracted from logs and displayed interactively.

## Features

- Visualization of philosophers' actions with colored bars.
- Interactive zoom on the chart.
- Legend to understand the different actions.
- Log input via a text field to generate the chart.

## Usage

1. Copy and paste the philosophers' logs into the text field.
2. Click on "Generate Chart" to generate the Gantt chart.
3. Use the zoom slider to adjust the scale of the chart.

## Example Logs

The logs should be formatted as follows:

```
<timestamp> <philosopher_number> <action>
```

For example:

```
0 1 has taken a fork
0 1 is eating
200 1 is sleeping
200 2 has taken a fork
200 2 is eating
400 1 is thinking
400 2 is sleeping
400 1 has taken a fork
400 1 is eating
600 1 is sleeping
600 2 is thinking
600 2 has taken a fork
600 2 is eating
```
