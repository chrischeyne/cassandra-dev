%# template for editing a task

<p>edit the task with ID = {{no}}</p>
<form action="/edit/{{no}}" method="get">

<input type="text" name="task" value="{{old[0]}}" size="100" maxlength="100">
<select name="status">
<option>open</option>

<option>closed</option>

</select>

<br />
<input type="submit" name="save" value="save">
</form>


